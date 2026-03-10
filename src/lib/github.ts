// GitHub API client for Pages deployment (client-side, BYOK token)

const GITHUB_TOKEN_KEY = 'biz-social-github-token';
const GITHUB_REPO_KEY = 'biz-social-github-repo';

export interface GitHubConfig {
  token: string;
  username?: string;
  repoName?: string;
  pagesUrl?: string;
}

// Token management
export function getGitHubToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GITHUB_TOKEN_KEY);
}

export function setGitHubToken(token: string): void {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
}

export function removeGitHubToken(): void {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  localStorage.removeItem(GITHUB_REPO_KEY);
}

export function getGitHubRepo(): { owner: string; repo: string; pagesUrl: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(GITHUB_REPO_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch { return null; }
}

export function saveGitHubRepo(owner: string, repo: string, pagesUrl: string): void {
  localStorage.setItem(GITHUB_REPO_KEY, JSON.stringify({ owner, repo, pagesUrl }));
}

// GitHub API helpers
async function githubFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  return res;
}

// Get authenticated user
export async function getGitHubUser(token: string): Promise<{ login: string; avatar_url: string } | null> {
  try {
    const res = await githubFetch('/user', token);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Validate token has required scopes
export async function validateToken(token: string): Promise<{ valid: boolean; login?: string; error?: string }> {
  try {
    const res = await githubFetch('/user', token);
    if (!res.ok) {
      return { valid: false, error: 'Invalid token. Please check and try again.' };
    }
    const scopes = res.headers.get('x-oauth-scopes') || '';
    // Need 'repo' or 'public_repo' scope for creating repos and pushing
    if (!scopes.includes('repo') && !scopes.includes('public_repo')) {
      return { valid: false, error: 'Token needs "repo" or "public_repo" scope. Please create a new token with this permission.' };
    }
    const user = await res.json();
    return { valid: true, login: user.login };
  } catch {
    return { valid: false, error: 'Could not connect to GitHub. Check your internet connection.' };
  }
}

// Create repository (or return existing)
export async function createRepo(token: string, repoName: string): Promise<{ success: boolean; fullName?: string; error?: string }> {
  try {
    // First check if repo exists
    const user = await getGitHubUser(token);
    if (!user) return { success: false, error: 'Could not authenticate with GitHub.' };

    const checkRes = await githubFetch(`/repos/${user.login}/${repoName}`, token);
    if (checkRes.ok) {
      // Repo exists, that's fine
      return { success: true, fullName: `${user.login}/${repoName}` };
    }

    // Create the repo
    const createRes = await githubFetch('/user/repos', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        description: 'My business website - powered by Ready Set Share',
        homepage: `https://${user.login}.github.io/${repoName}`,
        private: false,
        auto_init: true, // Creates with a README so we have a branch
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return { success: false, error: err.message || 'Could not create repository.' };
    }

    return { success: true, fullName: `${user.login}/${repoName}` };
  } catch {
    return { success: false, error: 'Failed to create repository.' };
  }
}

// Push file to repository
async function pushFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string
): Promise<boolean> {
  // First check if file exists to get its SHA (needed for updates)
  let sha: string | undefined;
  try {
    const checkRes = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token);
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch { /* File doesn't exist yet, that's fine */ }

  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.ok;
}

// Enable GitHub Pages on the repo
async function enablePages(token: string, owner: string, repo: string): Promise<boolean> {
  try {
    // Check if Pages is already enabled
    const checkRes = await githubFetch(`/repos/${owner}/${repo}/pages`, token);
    if (checkRes.ok) return true; // Already enabled

    // Enable Pages from main branch, root
    const res = await githubFetch(`/repos/${owner}/${repo}/pages`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: {
          branch: 'main',
          path: '/',
        },
      }),
    });

    return res.ok || res.status === 409; // 409 = already enabled
  } catch {
    return false;
  }
}

// Main deployment function
export async function deployToGitHubPages(
  token: string,
  repoName: string,
  htmlContent: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getGitHubUser(token);
    if (!user) return { success: false, error: 'Authentication failed.' };

    const owner = user.login;

    // 1. Create repo (or verify it exists)
    const repoResult = await createRepo(token, repoName);
    if (!repoResult.success) return { success: false, error: repoResult.error };

    // 2. Small delay to allow GitHub to finish repo initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Push index.html
    const pushed = await pushFile(token, owner, repoName, 'index.html', htmlContent, 'Update site via Ready Set Share');
    if (!pushed) return { success: false, error: 'Could not push files to repository.' };

    // 4. Enable GitHub Pages
    const pagesEnabled = await enablePages(token, owner, repoName);
    if (!pagesEnabled) {
      // Pages might take a moment to be available — the URL should still work eventually
    }

    const pagesUrl = `https://${owner}.github.io/${repoName}`;
    saveGitHubRepo(owner, repoName, pagesUrl);

    return { success: true, url: pagesUrl };
  } catch {
    return { success: false, error: 'Deployment failed. Please try again.' };
  }
}

// Slug a business name into a valid repo name
export function slugifyRepoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'my-business-site';
}
