'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getCurrentSeason, type SeasonInfo } from '@/lib/seasonal';
import { IoLeafOutline, IoCalendarOutline } from 'react-icons/io5';

function SeasonIcon({ season }: { season: string }) {
  // Animated icon depending on season
  const icons: Record<string, { emoji: string; animation: object }> = {
    Spring: {
      emoji: '🌸',
      animation: { rotate: [0, 10, -10, 5, 0], scale: [1, 1.1, 1, 1.05, 1] },
    },
    Summer: {
      emoji: '☀️',
      animation: { rotate: [0, 360], scale: [1, 1.05, 1] },
    },
    Fall: {
      emoji: '🍂',
      animation: { y: [0, -4, 2, -2, 0], rotate: [0, 15, -10, 5, 0] },
    },
    Winter: {
      emoji: '❄️',
      animation: { rotate: [0, 180, 360], opacity: [1, 0.7, 1] },
    },
  };

  const { emoji, animation } = icons[season] || icons.Fall;

  return (
    <motion.span
      className="text-2xl"
      animate={animation as { rotate?: number[]; scale?: number[]; y?: number[]; opacity?: number[] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.span>
  );
}

export default function SeasonalInsight() {
  const seasonInfo: SeasonInfo = useMemo(() => getCurrentSeason(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="overflow-hidden">
        {/* Season header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
            <SeasonIcon season={seasonInfo.season} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-brown text-sm font-[family-name:var(--font-heading)]">
              {seasonInfo.icon} {seasonInfo.season} Content Ideas
            </h3>
            <p className="text-xs text-brown-light mt-0.5 leading-relaxed">
              {seasonInfo.contentTips[0]}
            </p>
          </div>
        </div>

        {/* Upcoming events */}
        <AnimatePresence>
          {seasonInfo.upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <IoCalendarOutline className="w-3.5 h-3.5 text-sage-500" />
                <span className="text-[10px] font-medium text-sage-600 uppercase tracking-wide">Coming Up</span>
              </div>
              <div className="space-y-1.5">
                {seasonInfo.upcomingEvents.slice(0, 3).map((event, i) => (
                  <motion.div
                    key={event.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-cream-50"
                  >
                    <span className="text-xs text-brown font-medium">{event.name}</span>
                    <span className="text-[10px] text-gold-400 font-semibold">
                      {event.daysUntil === 0
                        ? 'Today!'
                        : event.daysUntil === 1
                        ? 'Tomorrow!'
                        : `in ${event.daysUntil} days`}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content themes this week */}
        {seasonInfo.contentTips.length > 1 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <IoLeafOutline className="w-3.5 h-3.5 text-sage-500" />
              <span className="text-[10px] font-medium text-sage-600 uppercase tracking-wide">Content Ideas</span>
            </div>
            <div className="space-y-1">
              {seasonInfo.contentTips.slice(1, 3).map((tip, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-xs text-brown-light leading-relaxed"
                >
                  &bull; {tip}
                </motion.p>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal hashtags */}
        <div>
          <span className="text-[10px] font-medium text-brown-light mb-1.5 block">Trending Hashtags</span>
          <div className="flex flex-wrap gap-1">
            {seasonInfo.hashtagSuggestions.slice(0, 6).map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <Badge variant="sage" className="text-[10px]">{tag}</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
