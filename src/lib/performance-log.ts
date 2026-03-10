// Content performance notes — track how posts perform after publishing

const PERF_LOG_KEY = 'biz-social-performance-log';

export interface PerformanceEntry {
  id: string;
  postId: string; // links to draft ID
  caption: string; // first 100 chars for reference
  platform: string;
  postedAt: string;
  loggedAt?: string;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5; // user's self-rating of how well it did
}

function getEntries(): PerformanceEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PERF_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries: PerformanceEntry[]): void {
  localStorage.setItem(PERF_LOG_KEY, JSON.stringify(entries));
}

/** Create a new performance entry when a post is approved */
export function createPerformanceEntry(
  postId: string,
  caption: string,
  platforms: string[],
): void {
  const entries = getEntries();
  const now = new Date().toISOString();
  const truncatedCaption = caption.slice(0, 100);

  // Create one entry per platform
  for (const platform of platforms) {
    const entry: PerformanceEntry = {
      id: `perf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      postId,
      caption: truncatedCaption,
      platform,
      postedAt: now,
    };
    entries.unshift(entry);
  }

  saveEntries(entries);
}

/** Log metrics for a performance entry */
export function logPerformance(
  entryId: string,
  metrics: Partial<Pick<PerformanceEntry, 'likes' | 'comments' | 'saves' | 'shares' | 'notes' | 'rating'>>,
): void {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx === -1) return;

  entries[idx] = {
    ...entries[idx],
    ...metrics,
    loggedAt: new Date().toISOString(),
  };

  saveEntries(entries);
}

/** Get all entries, newest first */
export function getPerformanceLog(): PerformanceEntry[] {
  return getEntries();
}

/** Get entries that haven't been logged yet (no loggedAt) */
export function getUnloggedEntries(): PerformanceEntry[] {
  return getEntries().filter(e => !e.loggedAt);
}

/** Get average metrics across all logged entries */
export function getAverageMetrics(): {
  avgLikes: number;
  avgComments: number;
  avgSaves: number;
  topRated: PerformanceEntry | null;
} {
  const entries = getEntries().filter(e => e.loggedAt);

  if (entries.length === 0) {
    return { avgLikes: 0, avgComments: 0, avgSaves: 0, topRated: null };
  }

  let totalLikes = 0;
  let totalComments = 0;
  let totalSaves = 0;
  let topRated: PerformanceEntry | null = null;

  for (const e of entries) {
    totalLikes += e.likes || 0;
    totalComments += e.comments || 0;
    totalSaves += e.saves || 0;

    if (e.rating && (!topRated || (topRated.rating || 0) < e.rating)) {
      topRated = e;
    }
  }

  return {
    avgLikes: Math.round((totalLikes / entries.length) * 10) / 10,
    avgComments: Math.round((totalComments / entries.length) * 10) / 10,
    avgSaves: Math.round((totalSaves / entries.length) * 10) / 10,
    topRated,
  };
}

/** Delete an entry */
export function deletePerformanceEntry(id: string): void {
  const entries = getEntries().filter(e => e.id !== id);
  saveEntries(entries);
}
