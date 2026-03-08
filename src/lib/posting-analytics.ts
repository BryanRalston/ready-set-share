// Best Time to Post — tracks posting history and recommends optimal times

export interface PostRecord {
  timestamp: number;
  platform: string;
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
}

export interface TimeSlot {
  day: number; // 0-6
  dayName: string;
  hour: number;
  label: string; // e.g. "10 AM"
  score: number; // 0-1 intensity
  source: 'industry' | 'personal' | 'both';
}

export interface WeekRecommendation {
  slots: TimeSlot[];
  hasPersonalData: boolean;
  postCount: number;
  topSlot: TimeSlot | null;
}

const STORAGE_KEY = 'wreath_post_history';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Industry best practices for craft/wreath businesses
const INDUSTRY_SCORES: Record<string, number> = {
  // Tue-Thu 10am-2pm (Instagram peak)
  '2-10': 0.9, '2-11': 1.0, '2-12': 0.95, '2-13': 0.85,
  '3-10': 0.95, '3-11': 1.0, '3-12': 0.9, '3-13': 0.8,
  '4-10': 0.85, '4-11': 0.9, '4-12': 0.85, '4-13': 0.75,
  // Tue-Thu 7-9pm (evening engagement)
  '2-19': 0.8, '2-20': 0.85, '3-19': 0.8, '3-20': 0.8,
  '4-19': 0.75, '4-20': 0.7,
  // Saturday Pinterest peak
  '6-20': 0.8, '6-21': 0.85, '6-22': 0.7,
  // Sunday Pinterest browsing
  '0-20': 0.75, '0-21': 0.8, '0-22': 0.65,
  // Weekday mornings
  '1-9': 0.5, '2-9': 0.6, '3-9': 0.6, '4-9': 0.55, '5-9': 0.5,
  // Friday lighter
  '5-11': 0.6, '5-12': 0.55,
};

// Seasonal adjustments — post more frequently before holidays
function getSeasonalMultiplier(): number {
  const month = new Date().getMonth() + 1;
  // Peak months: Oct, Nov, Dec
  if (month >= 10 && month <= 12) return 1.3;
  // Pre-Valentine's and Mother's Day
  if (month === 2 || month === 5) return 1.15;
  // Fall prep
  if (month === 9) return 1.1;
  return 1.0;
}

export function recordPost(platform: string): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const record: PostRecord = {
    timestamp: now.getTime(),
    platform,
    dayOfWeek: now.getDay(),
    hour: now.getHours(),
  };

  const history = getPostHistory();
  history.push(record);
  // Keep last 200 posts
  const trimmed = history.slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getPostHistory(): PostRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getPostCount(): number {
  return getPostHistory().length;
}

export function getBestTimesThisWeek(): WeekRecommendation {
  const history = getPostHistory();
  const hasPersonalData = history.length >= 10;
  const seasonalMult = getSeasonalMultiplier();

  // Build personal scores if enough data
  const personalScores: Record<string, number> = {};
  if (hasPersonalData) {
    const counts: Record<string, number> = {};
    for (const post of history) {
      const key = `${post.dayOfWeek}-${post.hour}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(counts), 1);
    for (const [key, count] of Object.entries(counts)) {
      personalScores[key] = count / maxCount;
    }
  }

  // Combine industry + personal scores
  const slots: TimeSlot[] = [];
  const hours = [8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22];

  for (let day = 0; day < 7; day++) {
    for (const hour of hours) {
      const key = `${day}-${hour}`;
      const industry = (INDUSTRY_SCORES[key] || 0.2) * seasonalMult;
      const personal = personalScores[key] || 0;

      let score: number;
      let source: 'industry' | 'personal' | 'both';

      if (hasPersonalData && personal > 0) {
        score = industry * 0.4 + personal * 0.6;
        source = 'both';
      } else if (hasPersonalData) {
        score = industry * 0.7;
        source = 'industry';
      } else {
        score = industry;
        source = 'industry';
      }

      // Clamp to 0-1
      score = Math.min(1, Math.max(0, score));

      if (score >= 0.3) {
        slots.push({
          day,
          dayName: DAY_NAMES[day],
          hour,
          label: formatHour(hour),
          score,
          source,
        });
      }
    }
  }

  // Sort by score descending
  slots.sort((a, b) => b.score - a.score);

  return {
    slots,
    hasPersonalData,
    postCount: history.length,
    topSlot: slots.length > 0 ? slots[0] : null,
  };
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function getHeatmapData(): { day: number; hour: number; score: number }[] {
  const recommendation = getBestTimesThisWeek();
  return recommendation.slots.map(s => ({
    day: s.day,
    hour: s.hour,
    score: s.score,
  }));
}
