// Reminder system using browser Notification API + localStorage

export interface Reminder {
  id: string;
  postId: string;
  dateTime: string; // ISO string
  caption: string; // preview text
  platforms: string[];
  fired: boolean;
}

const REMINDERS_KEY = 'biz-social-reminders';

function generateId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReminders(reminders: Reminder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function getReminders(): Reminder[] {
  return loadReminders();
}

export function addReminder(reminder: Omit<Reminder, 'id' | 'fired'>): Reminder {
  const reminders = loadReminders();
  const newReminder: Reminder = {
    ...reminder,
    id: generateId(),
    fired: false,
  };
  reminders.push(newReminder);
  saveReminders(reminders);
  return newReminder;
}

export function cancelReminder(id: string): void {
  const reminders = loadReminders();
  const updated = reminders.filter(r => r.id !== id);
  saveReminders(updated);
}

export function getUpcomingReminders(limit?: number): Reminder[] {
  const reminders = loadReminders();
  const now = new Date().toISOString();
  const upcoming = reminders
    .filter(r => !r.fired && r.dateTime > now)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function checkAndFireReminders(): void {
  if (typeof window === 'undefined') return;

  const reminders = loadReminders();
  const now = new Date().toISOString();
  let changed = false;

  for (const reminder of reminders) {
    if (!reminder.fired && reminder.dateTime <= now) {
      // Fire browser notification
      if (canNotify()) {
        const preview = reminder.caption.length > 80
          ? reminder.caption.slice(0, 77) + '...'
          : reminder.caption;
        new Notification('Time to post!', {
          body: preview || 'Your scheduled post is ready to go!',
          icon: '/icons/icon-192x192.png',
          tag: reminder.id,
        });
      }
      reminder.fired = true;
      changed = true;
    }
  }

  if (changed) {
    saveReminders(reminders);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function canNotify(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}
