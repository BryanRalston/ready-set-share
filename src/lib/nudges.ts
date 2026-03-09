// Gentle Nudge System — contextual, non-spammy reminders

import { getUpcomingDates, getSeasonalNudge } from './seasonal';

export interface Nudge {
  id: string;
  message: string;
  type: 'reminder' | 'seasonal' | 'streak' | 'tip';
  action?: 'upload' | 'schedule';
  photoId?: string;
  icon: string;
}

const HISTORY_KEY = 'biz-social-post-timestamps';
const DISMISSED_KEY = 'biz-social-nudge-dismissed';
const LAST_NUDGE_KEY = 'biz-social-nudge-last-shown';

export function recordPostTimestamp(): void {
  if (typeof window === 'undefined') return;
  const timestamps = getPostTimestamps();
  timestamps.push(Date.now());
  localStorage.setItem(HISTORY_KEY, JSON.stringify(timestamps.slice(-100)));
}

function getPostTimestamps(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getDaysSinceLastPost(): number | null {
  const timestamps = getPostTimestamps();
  if (timestamps.length === 0) return null;
  const last = Math.max(...timestamps);
  return Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
}

function getCurrentStreak(): number {
  const timestamps = getPostTimestamps();
  if (timestamps.length === 0) return 0;

  // Group by date
  const dates = new Set(
    timestamps.map(t => new Date(t).toDateString())
  );

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (dates.has(date.toDateString())) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been posted yet — that's ok, check yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function shouldShowNudge(): boolean {
  if (typeof window === 'undefined') return false;
  const lastShown = localStorage.getItem(LAST_NUDGE_KEY);
  if (!lastShown) return true;

  // Max 1 nudge per app session (we use a 30-minute cooldown as proxy)
  const elapsed = Date.now() - parseInt(lastShown, 10);
  return elapsed > 30 * 60 * 1000;
}

function markNudgeShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_NUDGE_KEY, Date.now().toString());
}

export function dismissNudge(nudgeId: string): void {
  if (typeof window === 'undefined') return;
  const dismissed = getDismissedNudges();
  dismissed.push({ id: nudgeId, timestamp: Date.now() });
  // Keep last 20
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed.slice(-20)));
}

function getDismissedNudges(): { id: string; timestamp: number }[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function isRecentlyDismissed(nudgeId: string): boolean {
  const dismissed = getDismissedNudges();
  const found = dismissed.find(d => d.id === nudgeId);
  if (!found) return false;
  // Don't show same nudge again for 24 hours
  return (Date.now() - found.timestamp) < 24 * 60 * 60 * 1000;
}

export function getCurrentNudge(): Nudge | null {
  if (typeof window === 'undefined') return null;
  if (!shouldShowNudge()) return null;

  const candidates: Nudge[] = [];
  const daysSince = getDaysSinceLastPost();
  const streak = getCurrentStreak();

  // Streak celebration (highest priority positive nudge)
  if (streak >= 3) {
    candidates.push({
      id: `streak-${streak}`,
      message: streak >= 7
        ? `You're on a ${streak}-day streak! You're unstoppable!`
        : `You're on a ${streak}-day posting streak! Keep it going!`,
      type: 'streak',
      icon: 'fire',
    });
  }

  // Inactivity reminder
  if (daysSince !== null && daysSince >= 2) {
    candidates.push({
      id: `inactive-${daysSince}`,
      message: daysSince >= 7
        ? `It's been ${daysSince} days since your last post. Your followers miss you! Let's get back at it.`
        : `You haven't posted in ${daysSince} days. A quick product photo keeps your audience engaged!`,
      type: 'reminder',
      action: 'upload',
      icon: 'clock',
    });
  }

  // Seasonal nudge
  const events = getUpcomingDates(14);
  if (events.length > 0) {
    const nearest = events[0];
    candidates.push({
      id: `event-${nearest.name}`,
      message: nearest.daysUntil <= 3
        ? `${nearest.name} is in ${nearest.daysUntil} days! Post your themed content NOW for maximum impact.`
        : nearest.daysUntil <= 7
        ? `${nearest.name} is in ${nearest.daysUntil} days — time to showcase your themed products!`
        : `${nearest.name} is coming up in ${nearest.daysUntil} days. Start planning your posts!`,
      type: 'seasonal',
      action: 'upload',
      icon: 'calendar',
    });
  } else {
    // General seasonal nudge
    candidates.push({
      id: `season-general`,
      message: getSeasonalNudge(),
      type: 'seasonal',
      icon: 'bulb',
    });
  }

  // First-time user nudge
  if (daysSince === null) {
    candidates.push({
      id: 'first-post',
      message: 'Upload your first product photo and let AI craft the perfect caption for you!',
      type: 'tip',
      action: 'upload',
      icon: 'bulb',
    });
  }

  // Tip nudges
  const tips = [
    { id: 'tip-carousel', message: 'Try posting a carousel next! Multi-image posts get 1.4x more reach than single photos.', icon: 'bulb' },
    { id: 'tip-bts', message: 'Behind-the-scenes content gets 2x more saves than finished product photos.', icon: 'bulb' },
    { id: 'tip-natural-light', message: 'Natural lighting is your best friend. Try shooting your next product near a window!', icon: 'bulb' },
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  candidates.push({
    ...randomTip,
    type: 'tip',
  });

  // Filter out recently dismissed
  const available = candidates.filter(n => !isRecentlyDismissed(n.id));
  if (available.length === 0) return null;

  // Priority: streak > seasonal events > inactivity > tips
  const priority: Record<string, number> = { streak: 4, seasonal: 3, reminder: 2, tip: 1 };
  available.sort((a, b) => (priority[b.type] || 0) - (priority[a.type] || 0));

  const chosen = available[0];
  markNudgeShown();
  return chosen;
}
