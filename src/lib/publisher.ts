// Orchestrates publishing (copy-to-clipboard) and manages drafts

export interface PostDraft {
  id: string;
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
  libraryPhotoId?: string;
  platforms: string[];
  scheduledFor?: string;
  createdAt: string;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

const DRAFTS_KEY = 'biz-social-drafts';

// Build the full post text from caption + hashtags
function buildPostText(caption: string, hashtags: string[]): string {
  const hashtagLine = hashtags
    .map(h => (h.startsWith('#') ? h : `#${h}`))
    .join(' ');
  return [caption, '', hashtagLine].join('\n');
}

// Copy post content to clipboard instead of calling server API routes
export async function publishPost(post: {
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
  platforms: string[];
  scheduledFor?: string;
}): Promise<{ results: PublishResult[] }> {
  const fullText = buildPostText(post.caption, post.hashtags);

  try {
    await navigator.clipboard.writeText(fullText);
    // Return a single success result — the text is on the clipboard
    return {
      results: [{
        platform: 'clipboard',
        success: true,
      }],
    };
  } catch {
    // Clipboard API can fail in headless browsers, iframes, or without user gesture.
    // Show a friendly message instead of the raw technical error.
    return {
      results: [{
        platform: 'clipboard',
        success: false,
        error: 'Unable to copy automatically — long-press the caption text above to copy it manually.',
      }],
    };
  }
}

// Share post via Web Share API with clipboard fallback
export async function sharePost(post: {
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
  platforms: string[];
}): Promise<{ results: PublishResult[]; shared: boolean }> {
  const fullText = buildPostText(post.caption, post.hashtags);

  // Check if Web Share API is available (primarily mobile)
  if (navigator.share) {
    try {
      const shareData: ShareData = {
        text: fullText,
      };

      // If we have an image, try to share it as a file (Web Share Level 2)
      if (post.imageBase64 || post.imageUrl) {
        const imageData = post.imageBase64 || post.imageUrl;
        if (imageData) {
          try {
            const blob = await dataUrlToBlob(imageData);
            const file = new File([blob], 'post.jpg', { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch {
            // Image sharing not supported, continue with text only
          }
        }
      }

      await navigator.share(shareData);
      return {
        results: [{ platform: 'share', success: true }],
        shared: true,
      };
    } catch (err) {
      // User cancelled the share dialog — not an error
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          results: [{ platform: 'share', success: false, error: 'Share cancelled' }],
          shared: false,
        };
      }
      // Fall through to clipboard
    }
  }

  // Fallback: clipboard copy
  const clipboardResult = await publishPost(post);
  return { ...clipboardResult, shared: false };
}

// Helper to convert base64 data URL to Blob
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}

// Check if Web Share API is available
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// --- Draft management (localStorage) ---

export function saveDraft(post: Omit<PostDraft, 'id' | 'createdAt'>, id?: string): PostDraft {
  const drafts = getDrafts();

  // If an id is provided, try to update the existing draft in place
  if (id) {
    const existingIndex = drafts.findIndex(d => d.id === id);
    if (existingIndex !== -1) {
      const updated: PostDraft = {
        ...post,
        id,
        createdAt: drafts[existingIndex].createdAt,
      };
      drafts[existingIndex] = updated;
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return updated;
    }
  }

  // New draft — generate a fresh ID
  const draft: PostDraft = {
    ...post,
    id: id || `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  drafts.unshift(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return draft;
}

export function getDrafts(): PostDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as PostDraft[];
  } catch {
    return [];
  }
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts();
  const filtered = drafts.filter(d => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
}

export function getDraftById(id: string): PostDraft | undefined {
  return getDrafts().find(d => d.id === id);
}
