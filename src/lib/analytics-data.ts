import { subDays, format, getDay } from 'date-fns';

// Realistic mock data showing an upward growth trend for a wreath business

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

export function getWeeklyPostData(): WeeklyPostData[] {
  const today = new Date();
  const data: WeeklyPostData[] = [];

  // 12 weeks of data showing upward trend
  const postCounts = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8];

  for (let i = 11; i >= 0; i--) {
    const weekStart = subDays(today, i * 7);
    data.push({
      week: format(weekStart, 'MMM d'),
      posts: postCounts[11 - i],
    });
  }

  return data;
}

export function getPlatformBreakdown(): PlatformData[] {
  return [
    { name: 'Instagram', value: 34, color: '#7C9A6E' },
    { name: 'Pinterest', value: 18, color: '#D4A574' },
    { name: 'Stories', value: 12, color: '#A8C5A0' },
  ];
}

export function getMonthStats(): MonthStats {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Simulate best day being Thursday (common for social media)
  const bestDayIndex = 4;

  return {
    totalPosts: 64,
    thisMonth: 8,
    avgPerWeek: 5.3,
    bestDay: dayNames[bestDayIndex],
  };
}

export function getMonthlyRecapData() {
  const now = new Date();
  const monthName = format(now, 'MMMM');

  return {
    month: monthName,
    postsThisMonth: 8,
    bestPost: {
      caption: 'Fall harvest wreath with dried sunflowers and wheat stalks',
      engagement: 142,
      platform: 'Instagram',
    },
    streakRecord: 12,
    topHashtag: '#wreathmaking',
    totalReach: 1240,
  };
}

// Daily post counts for the current month (for detailed view)
export function getDailyPostsThisMonth(): { date: string; count: number }[] {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const data: { date: string; count: number }[] = [];

  for (let i = 1; i <= dayOfMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    // More posts on weekdays, occasional misses
    const dayOfWeek = getDay(date);
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const random = Math.random();
    let count = 0;
    if (isWeekday) {
      count = random > 0.3 ? 1 : random > 0.1 ? 2 : 0;
    } else {
      count = random > 0.5 ? 1 : 0;
    }
    data.push({ date: format(date, 'MMM d'), count });
  }

  return data;
}
