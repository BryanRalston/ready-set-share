// Orchestrates sharing to social platforms with Web Share API + fallbacks, and manages drafts

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

export type ShareOutcome =
  | { method: 'native'; shared: true }
  | { method: 'native'; shared: false; reason: 'cancelled' | 'error' }
  | { method: 'intent'; platform: string }
  | { method: 'clipboard'; success: boolean };

const DRAFTS_KEY = 'biz-social-drafts';

// Build the full post text from caption + hashtags
export function buildPostText(caption: string, hashtags: string[]): string {
  const hashtagLine = hashtags
    .map(h => (h.startsWith('#') ? h : `#${h}`))
    .join(' ');
  return hashtagLine ? [caption, '', hashtagLine].join('\n') : caption;
}

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

/** Pre-copy caption + hashtags to clipboard. Returns true on success. */
export async function copyToClipboard(caption: string, hashtags: string[]): Promise<boolean> {
  const fullText = buildPostText(caption, hashtags);
  try {
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Web Share API (native share sheet)
// ---------------------------------------------------------------------------

/** Check if the browser supports the Web Share API */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/** Check if the browser supports sharing files via Web Share API Level 2 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.canShare) return false;
  try {
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Open the native share sheet with the post content.
 * Always pre-copies to clipboard first so it's ready to paste.
 * Returns the share outcome.
 */
export async function nativeShare(post: {
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
}): Promise<ShareOutcome> {
  const fullText = buildPostText(post.caption, post.hashtags);

  // Step 1: Always pre-copy to clipboard
  await copyToClipboard(post.caption, post.hashtags);

  // Step 2: Build share data
  const shareData: ShareData = { text: fullText };

  // Step 3: Try to include image as file (Web Share Level 2)
  const imageData = post.imageBase64 || post.imageUrl;
  if (imageData) {
    try {
      const blob = await dataUrlToBlob(imageData);
      const file = new File([blob], 'post.jpg', { type: blob.type || 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
    } catch {
      // Image sharing not supported — continue with text only
    }
  }

  // Step 4: Open native share sheet
  try {
    await navigator.share(shareData);
    return { method: 'native', shared: true };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { method: 'native', shared: false, reason: 'cancelled' };
    }
    return { method: 'native', shared: false, reason: 'error' };
  }
}

// ---------------------------------------------------------------------------
// Platform intent URLs (fallback for desktop / unsupported browsers)
// ---------------------------------------------------------------------------

export interface PlatformIntent {
  key: string;
  label: string;
  url: string;
  tip: string;
}

/** Generate platform-specific share intent URLs */
export function getPlatformIntents(caption: string, hashtags: string[]): PlatformIntent[] {
  const fullText = buildPostText(caption, hashtags);
  const encoded = encodeURIComponent(fullText);

  return [
    {
      key: 'twitter',
      label: 'X / Twitter',
      url: `https://twitter.com/intent/tweet?text=${encoded}`,
      tip: 'Your caption will be pre-filled — just hit post!',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?quote=${encoded}`,
      tip: 'Your caption will be included — review and share!',
    },
    {
      key: 'pinterest',
      label: 'Pinterest',
      url: `https://pinterest.com/pin/create/button/?description=${encoded}`,
      tip: 'Your caption will be included — pick a board and pin it!',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      url: '', // Instagram doesn't support pre-filled compose via URL
      tip: 'Your caption is copied — just paste it when Instagram opens!',
    },
  ];
}

/** Open a platform intent URL in a new window/tab */
export function openPlatformIntent(intent: PlatformIntent): void {
  if (intent.url) {
    window.open(intent.url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Share to a specific platform via intent URL.
 * Pre-copies to clipboard first, then opens the platform URL.
 */
export async function shareViaPlatform(
  platform: string,
  caption: string,
  hashtags: string[],
): Promise<ShareOutcome> {
  // Always pre-copy
  await copyToClipboard(caption, hashtags);

  const intents = getPlatformIntents(caption, hashtags);
  const intent = intents.find(i => i.key === platform);

  if (intent && intent.url) {
    openPlatformIntent(intent);
  }
  // For Instagram (no URL), clipboard is enough — the UI will show the tip

  return { method: 'intent', platform };
}

// ---------------------------------------------------------------------------
// Legacy publishPost (kept for backward compatibility)
// ---------------------------------------------------------------------------

export async function publishPost(post: {
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
  platforms: string[];
  scheduledFor?: string;
}): Promise<{ results: PublishResult[] }> {
  const success = await copyToClipboard(post.caption, post.hashtags);
  return {
    results: [{
      platform: 'clipboard',
      success,
      error: success ? undefined : 'Unable to copy automatically — long-press the caption text above to copy it manually.',
    }],
  };
}

// Legacy sharePost — now delegates to the new nativeShare flow
export async function sharePost(post: {
  caption: string;
  hashtags: string[];
  imageBase64?: string;
  imageUrl?: string;
  platforms: string[];
}): Promise<{ results: PublishResult[]; shared: boolean }> {
  if (canNativeShare()) {
    const outcome = await nativeShare(post);
    if (outcome.method === 'native' && outcome.shared) {
      return { results: [{ platform: 'share', success: true }], shared: true };
    }
    if (outcome.method === 'native' && !outcome.shared && outcome.reason === 'cancelled') {
      return { results: [{ platform: 'share', success: false, error: 'Share cancelled' }], shared: false };
    }
  }

  // Fallback to clipboard
  const clipboardResult = await publishPost(post);
  return { ...clipboardResult, shared: false };
}

// Helper to convert base64 data URL or URL to Blob
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}

// Legacy canShare — now aliases canNativeShare
export function canShare(): boolean {
  return canNativeShare();
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
