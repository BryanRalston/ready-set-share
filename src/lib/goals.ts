// Posting goal tracking — weekly targets with streak tracking

import { startOfWeek, isBefore, addWeeks, format } from 'date-fns';

const GOALS_KEY = 'biz-social-goals';

export interface PostingGoal {
  weeklyTarget: number; // posts per week (1-7)
  currentWeekStart: string; // ISO date of Monday of current tracking week
  postsThisWeek: number;
  streakWeeks: number; // consecutive weeks goal was met
  bestStreak: number;
  lastUpdated: string;
}

function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

function getStoredGoal(): PostingGoal | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveGoal(goal: PostingGoal): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goal));
}

function defaultGoal(): PostingGoal {
  return {
    weeklyTarget: 3,
    currentWeekStart: getMondayOfCurrentWeek(),
    postsThisWeek: 0,
    streakWeeks: 0,
    bestStreak: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/** Get the current goal (default: 3 posts/week) */
export function getGoal(): PostingGoal {
  const stored = getStoredGoal();
  if (!stored) {
    const goal = defaultGoal();
    saveGoal(goal);
    return goal;
  }
  return stored;
}

/** Set the weekly target */
export function setWeeklyTarget(target: number): void {
  const clamped = Math.min(7, Math.max(1, Math.round(target)));
  const goal = getGoal();
  goal.weeklyTarget = clamped;
  goal.lastUpdated = new Date().toISOString();
  saveGoal(goal);
}

/**
 * Check if current week has rolled over. If we're in a new week compared
 * to `currentWeekStart`, evaluate last week's goal and reset.
 */
export function checkWeekRollover(): void {
  const goal = getGoal();
  const currentMonday = getMondayOfCurrentWeek();

  if (goal.currentWeekStart === currentMonday) return; // still same week

  // We've crossed into a new week. Walk week-by-week from stored week
  // to handle multi-week gaps (e.g., user was away for 2 weeks).
  let weekCursor = new Date(goal.currentWeekStart + 'T00:00:00');
  const targetMonday = new Date(currentMonday + 'T00:00:00');
  let isFirstIteration = true;

  while (isBefore(weekCursor, targetMonday)) {
    if (isFirstIteration) {
      // Evaluate the stored week (the one with postsThisWeek data)
      if (goal.postsThisWeek >= goal.weeklyTarget) {
        goal.streakWeeks++;
        goal.bestStreak = Math.max(goal.bestStreak, goal.streakWeeks);
      } else {
        goal.streakWeeks = 0;
      }
      isFirstIteration = false;
    } else {
      // Any intermediate weeks the user missed — streak breaks
      goal.streakWeeks = 0;
    }
    weekCursor = addWeeks(weekCursor, 1);
  }

  goal.currentWeekStart = currentMonday;
  goal.postsThisWeek = 0;
  goal.lastUpdated = new Date().toISOString();
  saveGoal(goal);
}

/** Record a post for this week (call when user approves a post) */
export function recordGoalPost(): void {
  checkWeekRollover();
  const goal = getGoal();
  goal.postsThisWeek++;
  goal.lastUpdated = new Date().toISOString();
  saveGoal(goal);
}

/** Check if current week's goal is met */
export function isGoalMet(): boolean {
  const goal = getGoal();
  return goal.postsThisWeek >= goal.weeklyTarget;
}

/** Get progress as a percentage (0-100) */
export function getGoalProgress(): number {
  const goal = getGoal();
  if (goal.weeklyTarget === 0) return 100;
  return Math.min(100, Math.round((goal.postsThisWeek / goal.weeklyTarget) * 100));
}
