'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { getBestTimesThisWeek, type WeekRecommendation } from '@/lib/posting-analytics';
import { IoTimeOutline, IoSparklesOutline } from 'react-icons/io5';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DISPLAY_HOURS = [9, 10, 11, 12, 13, 14, 19, 20, 21];

function formatHourShort(hour: number): string {
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

function getHeatColor(score: number): string {
  if (score >= 0.85) return 'bg-sage-500 text-white';
  if (score >= 0.7) return 'bg-sage-400 text-white';
  if (score >= 0.55) return 'bg-sage-300 text-white';
  if (score >= 0.4) return 'bg-sage-200 text-brown';
  if (score >= 0.3) return 'bg-sage-100 text-brown-light';
  return 'bg-cream-50 text-brown-light/30';
}

export default function BestTimes() {
  const [recommendation, setRecommendation] = useState<WeekRecommendation | null>(null);

  useEffect(() => {
    setRecommendation(getBestTimesThisWeek());
  }, []);

  if (!recommendation) return null;

  // Build a lookup: `day-hour` -> score
  const scoreMap = new Map<string, number>();
  for (const slot of recommendation.slots) {
    scoreMap.set(`${slot.day}-${slot.hour}`, slot.score);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">
            <IoTimeOutline className="w-4 h-4 text-sage-500" />
          </div>
          <div>
            <h3 className="font-semibold text-brown text-sm font-[family-name:var(--font-heading)]">
              Best Times This Week
            </h3>
            <div className="flex items-center gap-1">
              <IoSparklesOutline className="w-3 h-3 text-gold-300" />
              <span className="text-[10px] text-brown-light">
                {recommendation.hasPersonalData
                  ? `Based on your ${recommendation.postCount} posts`
                  : 'Based on wreath businesses like yours'}
              </span>
            </div>
          </div>
        </div>

        {/* Top recommendation */}
        {recommendation.topSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="my-3 py-2 px-3 rounded-lg bg-sage-50 border border-sage-200"
          >
            <p className="text-xs text-sage-700 font-medium">
              Best slot: {recommendation.topSlot.dayName} at {recommendation.topSlot.label}
            </p>
          </motion.div>
        )}

        {/* Heatmap grid */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[280px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-0.5 mb-1">
              <div /> {/* Empty corner cell */}
              {DAYS.map((day) => (
                <div key={day} className="text-center text-[9px] font-medium text-brown-light py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {DISPLAY_HOURS.map((hour, hi) => (
              <div key={hour} className="grid grid-cols-8 gap-0.5 mb-0.5">
                {/* Hour label */}
                <div className="flex items-center justify-end pr-1">
                  <span className="text-[9px] text-brown-light">{formatHourShort(hour)}</span>
                </div>
                {/* Day cells */}
                {DAYS.map((_, dayIdx) => {
                  const score = scoreMap.get(`${dayIdx}-${hour}`) || 0;
                  const colorClass = getHeatColor(score);
                  return (
                    <motion.div
                      key={`${dayIdx}-${hour}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + hi * 0.03 + dayIdx * 0.02 }}
                    >
                      <Link href="/upload">
                        <motion.div
                          whileTap={{ scale: 0.85 }}
                          className={`aspect-square rounded-md ${colorClass} flex items-center justify-center cursor-pointer transition-all hover:ring-1 hover:ring-sage-400`}
                          title={`${DAYS[dayIdx]} ${formatHourShort(hour)} — ${Math.round(score * 100)}% engagement`}
                        >
                          {score >= 0.85 && (
                            <span className="text-[8px] font-bold">!</span>
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <span className="text-[9px] text-brown-light">Low</span>
          <div className="flex gap-0.5">
            {['bg-cream-50', 'bg-sage-100', 'bg-sage-200', 'bg-sage-300', 'bg-sage-400', 'bg-sage-500'].map((bg, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${bg}`} />
            ))}
          </div>
          <span className="text-[9px] text-brown-light">High</span>
        </div>

        <p className="text-[9px] text-brown-light/50 text-center mt-2">
          Tap a time slot to start a post
        </p>
      </Card>
    </motion.div>
  );
}
