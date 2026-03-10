'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getCurrentNudge, dismissNudge, type Nudge } from '@/lib/nudges';
import { isGeminiConfigured } from '@/lib/gemini';
import { getPostCount } from '@/lib/posting-analytics';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoFlameOutline,
  IoBulbOutline,
  IoCloseOutline,
  IoKeyOutline,
  IoCameraOutline,
} from 'react-icons/io5';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: IoTimeOutline,
  calendar: IoCalendarOutline,
  fire: IoFlameOutline,
  bulb: IoBulbOutline,
  key: IoKeyOutline,
  camera: IoCameraOutline,
};

const TYPE_STYLES: Record<string, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  reminder: { bg: 'bg-gold-50', border: 'border-gold-200', iconBg: 'bg-gold-100', iconColor: 'text-gold-400' },
  seasonal: { bg: 'bg-sage-50', border: 'border-sage-200', iconBg: 'bg-sage-100', iconColor: 'text-sage-600' },
  streak: { bg: 'bg-gold-50', border: 'border-gold-200', iconBg: 'bg-gold-100', iconColor: 'text-gold-400' },
  tip: { bg: 'bg-sage-50', border: 'border-sage-200', iconBg: 'bg-eucalyptus-light/50', iconColor: 'text-sage-600' },
};

/**
 * Determines a single CTA based on what the user hasn't done yet.
 * Priority: upload photo > create post > schedule
 */
function getSingleCTA(): { label: string; href: string; icon: string; message: string } | null {
  if (typeof window === 'undefined') return null;

  const postCount = getPostCount();
  const hasPhotos = (() => {
    try {
      const stored = localStorage.getItem('biz-social-photo-count');
      return stored ? parseInt(stored, 10) > 0 : false;
    } catch { return false; }
  })();
  const hasScheduled = (() => {
    try {
      const stored = localStorage.getItem('biz-social-drafts');
      if (!stored) return false;
      const drafts = JSON.parse(stored);
      return Array.isArray(drafts) && drafts.some((d: { scheduledFor?: string }) => d.scheduledFor);
    } catch { return false; }
  })();

  if (!hasPhotos) {
    return {
      label: 'Upload a Photo',
      href: '/upload',
      icon: 'camera',
      message: 'Start by uploading your first product photo!',
    };
  }

  if (postCount === 0) {
    return {
      label: 'Create Your First Post',
      href: '/upload',
      icon: 'bulb',
      message: 'You have photos ready — let\'s turn one into a post!',
    };
  }

  if (!hasScheduled) {
    return {
      label: 'Schedule a Post',
      href: '/calendar',
      icon: 'calendar',
      message: 'Set up a posting schedule to stay consistent.',
    };
  }

  return null;
}

export default function NudgeCard() {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [singleCTA, setSingleCTA] = useState<ReturnType<typeof getSingleCTA>>(null);
  const [dismissed, setDismissed] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  useEffect(() => {
    const cta = getSingleCTA();
    setSingleCTA(cta);

    // API key nudge takes priority over all others
    if (!isGeminiConfigured()) {
      setNudge({
        id: 'setup-ai-key',
        message: 'Get personalized captions for your products — it\'s free!',
        type: 'tip',
        action: 'setup-ai' as Nudge['action'],
        icon: 'key',
      });
      return;
    }

    // If we have a single CTA, use that instead of the nudge system
    if (cta) {
      setNudge({
        id: `cta-${cta.label}`,
        message: cta.message,
        type: 'tip',
        icon: cta.icon,
      });
      return;
    }

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

  // Single CTA takes precedence, then nudge action, then AI setup
  const actionHref = singleCTA
    ? singleCTA.href
    : nudge.action === 'upload' ? '/upload'
    : (nudge.action as string) === 'setup-ai' ? '/profile'
    : nudge.action === 'schedule' ? '/calendar'
    : null;

  const actionLabel = singleCTA
    ? singleCTA.label
    : nudge.action === 'upload' ? 'Upload a Photo'
    : (nudge.action as string) === 'setup-ai' ? 'Set up AI captions'
    : nudge.action === 'schedule' ? 'Schedule a Post'
    : null;

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
            <div className={`w-9 h-9 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${styles.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-brown leading-relaxed">{nudge.message}</p>

              {actionHref && actionLabel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2"
                >
                  <Link href={actionHref}>
                    <Button size="sm" variant="secondary">
                      {actionLabel}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-brown-light/50 hover:text-brown-light hover:bg-cream-200 transition-colors shrink-0"
            >
              <IoCloseOutline className="w-4 h-4" />
            </button>
          </div>

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
