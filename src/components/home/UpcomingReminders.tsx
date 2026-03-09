'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { IoNotificationsOutline } from 'react-icons/io5';
import type { Reminder } from '@/lib/reminders';

function formatReminderDate(dateTime: string): string {
  const date = new Date(dateTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  }

  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  }

  // Otherwise show date
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr} at ${timeStr}`;
}

interface UpcomingRemindersProps {
  reminders: Reminder[];
}

export default function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  if (reminders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IoNotificationsOutline className="w-4 h-4 text-gold-300" />
        <h3 className="font-semibold text-brown text-sm">Upcoming Reminders</h3>
      </div>

      <div className="space-y-2.5">
        {reminders.map((reminder, i) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.08 }}
          >
            <Card animate={false}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
                  <IoNotificationsOutline className="w-4 h-4 text-gold-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gold-400 mb-0.5">
                    {formatReminderDate(reminder.dateTime)}
                  </p>
                  <p className="text-sm text-brown line-clamp-1">
                    {reminder.caption.length > 60
                      ? reminder.caption.slice(0, 57) + '...'
                      : reminder.caption || 'Scheduled post'}
                  </p>
                  {reminder.platforms.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {reminder.platforms.map(p => (
                        <span
                          key={p}
                          className="text-[10px] bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
