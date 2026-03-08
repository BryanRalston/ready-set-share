'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getCurrentNudge, dismissNudge, type Nudge } from '@/lib/nudges';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoFlameOutline,
  IoBulbOutline,
  IoCloseOutline,
} from 'react-icons/io5';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: IoTimeOutline,
  calendar: IoCalendarOutline,
  fire: IoFlameOutline,
  bulb: IoBulbOutline,
};

const TYPE_STYLES: Record<string, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  reminder: { bg: 'bg-gold-50', border: 'border-gold-200', iconBg: 'bg-gold-100', iconColor: 'text-gold-400' },
  seasonal: { bg: 'bg-sage-50', border: 'border-sage-200', iconBg: 'bg-sage-100', iconColor: 'text-sage-600' },
  streak: { bg: 'bg-gold-50', border: 'border-gold-200', iconBg: 'bg-gold-100', iconColor: 'text-gold-400' },
  tip: { bg: 'bg-sage-50', border: 'border-sage-200', iconBg: 'bg-eucalyptus-light/50', iconColor: 'text-sage-600' },
};

export default function NudgeCard() {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  useEffect(() => {
    const n = getCurrentNudge();
    setNudge(n);
  }, []);

  const handleDismiss = () => {
    if (nudge) {
      dismissNudge(nudge.id);
    }
    setDismissed(true);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      handleDismiss();
    }
  };

  if (!nudge || dismissed) return null;

  const styles = TYPE_STYLES[nudge.type] || TYPE_STYLES.tip;
  const Icon = ICON_MAP[nudge.icon] || IoBulbOutline;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          style={{ x, opacity }}
          className={`rounded-2xl border ${styles.bg} ${styles.border} p-3.5 shadow-sm cursor-grab active:cursor-grabbing touch-pan-y`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${styles.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brown leading-relaxed">{nudge.message}</p>

              {/* Action button */}
              {nudge.action && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2"
                >
                  <Link href={nudge.action === 'upload' ? '/upload' : '/calendar'}>
                    <Button size="sm" variant="secondary">
                      {nudge.action === 'upload' ? 'Upload a Photo' : 'Schedule a Post'}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-brown-light/50 hover:text-brown-light hover:bg-cream-200 transition-colors shrink-0"
            >
              <IoCloseOutline className="w-4 h-4" />
            </button>
          </div>

          {/* Swipe hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2 }}
            className="text-[9px] text-brown-light text-center mt-1.5"
          >
            swipe to dismiss
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
