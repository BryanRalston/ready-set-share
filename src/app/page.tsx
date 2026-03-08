'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/user-context';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  IoSparklesOutline,
  IoFlameOutline,
  IoAddOutline,
  IoCalendarOutline,
  IoImageOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import NudgeCard from '@/components/home/NudgeCard';
import SeasonalTip from '@/components/home/SeasonalTip';
import StreakTracker from '@/components/home/StreakTracker';
import DraftsList from '@/components/home/DraftsList';
import { getDrafts, type PostDraft } from '@/lib/publisher';
import { getCurrentStreak } from '@/lib/streak';
import { getPostCount } from '@/lib/posting-analytics';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { displayName } = useUser();
  const greeting = useMemo(() => getGreeting(), []);

  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    const allDrafts = getDrafts();
    setDrafts(allDrafts);
    setPostCount(getPostCount());
    setStreak(getCurrentStreak());
    setScheduledCount(allDrafts.filter(d => d.scheduledFor).length);
  }, []);

  const hasPosts = drafts.length > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Nudge card — top of page */}
        <NudgeCard />

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
            {greeting}, {displayName}!
          </h2>
          <p className="text-brown-light text-sm mt-1">Let&apos;s grow your wreath business today.</p>
        </motion.div>

        {/* Quick stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card padding="sm" className="text-center">
            <IoImageOutline className="w-5 h-5 text-sage-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-brown">{postCount}</p>
            <p className="text-[10px] text-brown-light">Posts</p>
          </Card>
          <Card padding="sm" className="text-center">
            <IoFlameOutline className="w-5 h-5 text-gold-300 mx-auto mb-1" />
            <p className="text-lg font-bold text-brown">{streak}</p>
            <p className="text-[10px] text-brown-light">Day Streak</p>
          </Card>
          <Card padding="sm" className="text-center">
            <IoCalendarOutline className="w-5 h-5 text-sage-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-brown">{scheduledCount}</p>
            <p className="text-[10px] text-brown-light">Scheduled</p>
          </Card>
        </motion.div>

        {/* Streak tracker */}
        <StreakTracker />

        {/* Seasonal tip */}
        <SeasonalTip />

        {/* Content area */}
        {!hasPosts ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card padding="lg" className="text-center">
              {/* Wreath composition */}
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <motion.span
                  className="absolute text-4xl"
                  style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  🌿
                </motion.span>
                <motion.span
                  className="absolute text-2xl"
                  style={{ bottom: 4, left: 4 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  🌸
                </motion.span>
                <motion.span
                  className="absolute text-2xl"
                  style={{ bottom: 4, right: 4 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                  🍃
                </motion.span>
              </div>
              <h3 className="text-lg font-semibold text-brown font-[family-name:var(--font-heading)] mb-2">
                Your wreath journey starts here
              </h3>
              <p className="text-sm text-brown-light mb-5 max-w-[260px] mx-auto">
                Upload your first photo and watch the magic happen
              </p>
              {/* Arrow pointing down toward upload button */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sage-400 mb-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto">
                  <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <Link href="/upload">
                <Button size="md" className="gap-2">
                  <IoSparklesOutline className="w-4 h-4" />
                  Get Started
                </Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brown">Upcoming Posts</h3>
              <Link href="/calendar" className="text-sm text-sage-500 font-medium">
                View all
              </Link>
            </div>
            {drafts.map((draft, i) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Link href={`/post/${draft.id}`}>
                  <Card className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-cream-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {draft.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>🌿</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-brown line-clamp-2">{draft.caption}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {draft.platforms.map(p => (
                          <span key={p} className="text-[10px] bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full">{p}</span>
                        ))}
                        {draft.scheduledFor && (
                          <span className="text-[10px] text-brown-light">{new Date(draft.scheduledFor).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Saved Drafts */}
        <DraftsList />

        {/* Tips card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-sage-50 border-sage-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center shrink-0 mt-0.5">
                <IoSparklesOutline className="w-4 h-4 text-sage-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-sage-700 mb-0.5">Tip of the day</h4>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Photos with natural lighting and a clean background get 40% more engagement on Instagram. Try shooting near a window!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* FAB */}
      <Link href="/upload">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-sage-500 text-white shadow-lg shadow-sage-500/30 flex items-center justify-center z-20 sm:right-[calc(50%-224px+16px)]"
        >
          <IoAddOutline className="w-7 h-7" />
        </motion.div>
      </Link>
    </AppShell>
  );
}
