import { subDays, format, startOfMonth, differenceInCalendarWeeks } from 'date-fns';
import { getPostHistory, type PostRecord } from './posting-analytics';
import { getDrafts } from './publisher';
import { getLongestStreak } from './streak';

// Interfaces (unchanged — components depend on these)

export interface WeeklyPostData {
  week: string;
  posts: number;
}

export interface PlatformData {
  name: string;
  value: number;
  color: string;
}

export interface MonthStats {
  totalPosts: number;
  thisMonth: number;
  avgPerWeek: number;
  bestDay: string;
}

export interface MonthlyRecapData {
  month: string;
  postsThisMonth: number;
  bestPost: {
    caption: string;
    engagement: number;
    platform: string;
  };
  streakRecord: number;
  topHashtag: string;
  totalReach: number;
}

// ── helpers ──────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#7C9A6E',
  Pinterest: '#D4A574',
  Stories: '#A8C5A0',
  Facebook: '#8B6F5A',
  TikTok: '#C4956A',
  clipboard: '#7C9A6E',
};

function getPostTimestamps(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('biz-social-post-timestamps');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getDraftHistory(): { caption: string; hashtags: string[]; platforms: string[]; createdAt: string }[] {
  return getDrafts().map(d => ({
    caption: d.caption,
    hashtags: d.hashtags,
    platforms: d.platforms,
    createdAt: d.createdAt,
  }));
}

/**
 * Merge all available timestamp sources into one sorted array.
 * Post history has rich records; timestamps are bare numbers.
 * We use PostRecord[] as the canonical shape and fill in what we can.
 */
function getAllPostRecords(): PostRecord[] {
  const history = getPostHistory(); // PostRecord[]
  const timestamps = getPostTimestamps(); // number[]

  // Build a Set of timestamps we already know from history so we don't double-count
  const knownTimestamps = new Set(history.map(r => r.timestamp));

  // Add any timestamps from nudges that aren't already in the post history
  for (const ts of timestamps) {
    if (!knownTimestamps.has(ts)) {
      const d = new Date(ts);
      history.push({
        timestamp: ts,
        platform: 'unknown',
        dayOfWeek: d.getDay(),
        hour: d.getHours(),
      });
    }
  }

  // Sort chronologically
  history.sort((a, b) => a.timestamp - b.timestamp);
  return history;
}

// ── exported functions ───────────────────────────────────────────────

/**
 * Posts per week for the last 12 weeks, calculated from real post history.
 * Returns all zeros when there is no data.
 */
export function getWeeklyPostData(): WeeklyPostData[] {
  const today = new Date();
  const records = getAllPostRecords();
  const data: WeeklyPostData[] = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = subDays(today, i * 7);
    const weekEnd = i === 0 ? today : subDays(today, (i - 1) * 7);
    const weekStartMs = weekStart.getTime();
    const weekEndMs = weekEnd.getTime();

    const count = records.filter(
      r => r.timestamp >= weekStartMs && r.timestamp < weekEndMs,
    ).length;

    data.push({
      week: format(weekStart, 'MMM d'),
      posts: count,
    });
  }

  return data;
}

/**
 * Post counts grouped by platform, from real post history + drafts.
 * Returns empty array when there is no data.
 */
export function getPlatformBreakdown(): PlatformData[] {
  const records = getAllPostRecords();
  const drafts = getDraftHistory();

  const counts: Record<string, number> = {};

  // Count posts by platform
  for (const r of records) {
    const platform = r.platform === 'unknown' ? 'Other' : r.platform;
    counts[platform] = (counts[platform] || 0) + 1;
  }

  // Also count published drafts by platform (each draft may target multiple platforms)
  for (const d of drafts) {
    for (const p of d.platforms) {
      counts[p] = (counts[p] || 0) + 1;
    }
  }

  if (Object.keys(counts).length === 0) return [];

  // Convert to PlatformData[]
  const fallbackColors = ['#7C9A6E', '#D4A574', '#A8C5A0', '#8B6F5A', '#C4956A'];
  let colorIdx = 0;

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      color: PLATFORM_COLORS[name] || fallbackColors[colorIdx++ % fallbackColors.length],
    }));
}

/**
 * Aggregate stats: total posts, this month's posts, average per week, best day.
 * Returns zeros / '--' when there is no data.
 */
export function getMonthStats(): MonthStats {
  const records = getAllPostRecords();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (records.length === 0) {
    return {
      totalPosts: 0,
      thisMonth: 0,
      avgPerWeek: 0,
      bestDay: '--',
    };
  }

  const now = new Date();
  const monthStart = startOfMonth(now).getTime();

  const thisMonth = records.filter(r => r.timestamp >= monthStart).length;

  // Average per week: total posts / number of weeks spanned (at least 1)
  const earliest = new Date(records[0].timestamp);
  const weekSpan = Math.max(1, differenceInCalendarWeeks(now, earliest, { weekStartsOn: 0 }) + 1);
  const avgPerWeek = Math.round((records.length / weekSpan) * 10) / 10;

  // Best day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const r of records) {
    dayCounts[r.dayOfWeek]++;
  }
  const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));

  return {
    totalPosts: records.length,
    thisMonth,
    avgPerWeek,
    bestDay: dayNames[bestDayIndex],
  };
}

/**
 * Monthly recap data built from real post history and streak data.
 * Returns null when there is no data so the UI can show empty state.
 */
export function getMonthlyRecapData(): MonthlyRecapData | null {
  const records = getAllPostRecords();
  const drafts = getDraftHistory();
  const now = new Date();
  const monthName = format(now, 'MMMM');
  const monthStart = startOfMonth(now).getTime();

  const thisMonthRecords = records.filter(r => r.timestamp >= monthStart);
  const postsThisMonth = thisMonthRecords.length;

  if (postsThisMonth === 0 && records.length === 0) {
    return null;
  }

  // Best post: pick the most recent draft this month (we don't have engagement data)
  const thisMonthDrafts = drafts.filter(d => new Date(d.createdAt).getTime() >= monthStart);
  const bestDraft = thisMonthDrafts[0]; // drafts are newest-first from getDrafts()
  const bestPost = bestDraft
    ? {
        caption: bestDraft.caption,
        engagement: 0,
        platform: bestDraft.platforms[0] || 'clipboard',
      }
    : {
        caption: 'No posts yet this month',
        engagement: 0,
        platform: '--',
      };

  // Top hashtag from drafts
  const hashtagCounts: Record<string, number> = {};
  for (const d of drafts) {
    for (const h of d.hashtags) {
      const normalized = h.startsWith('#') ? h : `#${h}`;
      hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
    }
  }
  const topHashtag = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '--';

  // Streak record from streak.ts
  const streakRecord = getLongestStreak();

  return {
    month: monthName,
    postsThisMonth,
    bestPost,
    streakRecord,
    topHashtag,
    totalReach: records.length, // no real reach data, use total post count as proxy
  };
}

/**
 * Daily post counts for the current month, from real post timestamps.
 * Returns zeros for days with no posts.
 */
export function getDailyPostsThisMonth(): { date: string; count: number }[] {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const records = getAllPostRecords();
  const data: { date: string; count: number }[] = [];

  for (let i = 1; i <= dayOfMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const nextDate = new Date(today.getFullYear(), today.getMonth(), i + 1);
    const dayStart = date.getTime();
    const dayEnd = nextDate.getTime();

    const count = records.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd).length;

    data.push({ date: format(date, 'MMM d'), count });
  }

  return data;
}
