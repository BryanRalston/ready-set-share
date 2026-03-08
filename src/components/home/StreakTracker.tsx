'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import {
  getCurrentStreak,
  getStreakCalendar,
  getMilestone,
  type StreakDay,
  type Milestone,
} from '@/lib/streak';
import { format } from 'date-fns';

export default function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [calendar, setCalendar] = useState<StreakDay[]>([]);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStreak(getCurrentStreak());
    setCalendar(getStreakCalendar(14));
    setMilestone(getMilestone(getCurrentStreak()));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          {/* Flame + streak number */}
          <div className="flex items-center gap-2">
            <motion.span
              className="text-3xl"
              animate={{
                scale: [1, 1.15, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🔥
            </motion.span>
            <div>
              <p className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
                {streak}
              </p>
              <p className="text-[10px] text-brown-light -mt-0.5">day posting streak!</p>
            </div>
          </div>

          {/* Milestone badge */}
          {milestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
              className="flex items-center gap-1 bg-gold-50 border border-gold-200 rounded-full px-2.5 py-1"
            >
              <span className="text-xs">{milestone.icon}</span>
              <span className="text-[10px] font-semibold text-gold-400">{milestone.name}</span>
            </motion.div>
          )}
        </div>

        {/* Streak calendar — last 14 days */}
        <div className="flex items-center gap-1 justify-between">
          {calendar.map((day, i) => (
            <motion.div
              key={day.dateKey}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + i * 0.04,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
              className="flex flex-col items-center gap-0.5"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  day.posted
                    ? 'bg-sage-500'
                    : 'bg-cream-200 border border-cream-200'
                }`}
              >
                {day.posted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[8px] text-brown-light/60">
                {format(day.date, 'd')}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
