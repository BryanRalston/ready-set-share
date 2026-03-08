import { format, subDays, differenceInCalendarDays, startOfDay } from 'date-fns';

const STREAK_KEY = 'wreath-social-streak-data';

interface StreakData {
  postDates: string[]; // ISO date strings (YYYY-MM-DD)
}

function getStreakData(): StreakData {
  if (typeof window === 'undefined') return { postDates: [] };
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return { postDates: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { postDates: [] };
  }
}

function saveStreakData(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function recordPost(): void {
  const data = getStreakData();
  const today = toDateKey(new Date());
  if (!data.postDates.includes(today)) {
    data.postDates.push(today);
    saveStreakData(data);
  }
}

export function getCurrentStreak(): number {
  const data = getStreakData();
  if (data.postDates.length === 0) return 0;

  const sortedDates = [...new Set(data.postDates)].sort().reverse();
  const today = startOfDay(new Date());
  const mostRecent = startOfDay(new Date(sortedDates[0]));

  // If last post was more than 1 day ago, streak is broken
  const daysSinceLastPost = differenceInCalendarDays(today, mostRecent);
  if (daysSinceLastPost > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = startOfDay(new Date(sortedDates[i]));
    const prev = startOfDay(new Date(sortedDates[i - 1]));
    const diff = differenceInCalendarDays(prev, curr);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(): number {
  const data = getStreakData();
  if (data.postDates.length === 0) return 0;

  const sortedDates = [...new Set(data.postDates)].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const curr = startOfDay(new Date(sortedDates[i]));
    const prev = startOfDay(new Date(sortedDates[i - 1]));
    const diff = differenceInCalendarDays(curr, prev);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export interface StreakDay {
  date: Date;
  dateKey: string;
  posted: boolean;
}

export function getStreakCalendar(days: number): StreakDay[] {
  const data = getStreakData();
  const dateSet = new Set(data.postDates);
  const today = new Date();
  const calendar: StreakDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateKey = toDateKey(date);
    calendar.push({
      date,
      dateKey,
      posted: dateSet.has(dateKey),
    });
  }

  return calendar;
}

export interface Milestone {
  name: string;
  icon: string;
  days: number;
  unlocked: boolean;
}

const MILESTONES = [
  { days: 7, name: 'Week Warrior', icon: '⚔️' },
  { days: 14, name: 'Consistent Creator', icon: '🎨' },
  { days: 30, name: 'Monthly Maven', icon: '👑' },
  { days: 60, name: 'Social Pro', icon: '💎' },
  { days: 90, name: 'Wreath Queen', icon: '🏆' },
];

export function getMilestone(streak: number): Milestone | null {
  // Return the highest milestone achieved
  let best: Milestone | null = null;
  for (const m of MILESTONES) {
    if (streak >= m.days) {
      best = { ...m, unlocked: true };
    }
  }
  return best;
}

export function getAllMilestones(streak: number): Milestone[] {
  return MILESTONES.map((m) => ({
    ...m,
    unlocked: streak >= m.days,
  }));
}

// Seed mock data for demo purposes
export function seedMockStreakData(): void {
  const data = getStreakData();
  if (data.postDates.length > 0) return; // Already seeded

  const today = new Date();
  const mockDates: string[] = [];

  // Create a 12-day streak ending today
  for (let i = 0; i < 12; i++) {
    mockDates.push(toDateKey(subDays(today, i)));
  }
  // Add a gap, then a 3-day streak
  for (let i = 14; i < 17; i++) {
    mockDates.push(toDateKey(subDays(today, i)));
  }

  saveStreakData({ postDates: mockDates });
}
