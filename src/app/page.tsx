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
  IoCameraOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import NudgeCard from '@/components/home/NudgeCard';
import ContentIdea from '@/components/home/ContentIdea';
import UpcomingReminders from '@/components/home/UpcomingReminders';
import StreakTracker from '@/components/home/StreakTracker';
import DraftsList from '@/components/home/DraftsList';
import { getDrafts, type PostDraft } from '@/lib/publisher';
import { getCurrentStreak } from '@/lib/streak';
import { getPostCount } from '@/lib/posting-analytics';
import { checkAndFireReminders, getUpcomingReminders, type Reminder } from '@/lib/reminders';
import { getBusinessTypeInfo, type BusinessType } from '@/lib/business-profile';
import { checkWeekRollover } from '@/lib/goals';
import GoalTracker from '@/components/home/GoalTracker';
import WeeklyPlan from '@/components/home/WeeklyPlan';
import PerformancePrompt from '@/components/home/PerformancePrompt';
import { SkeletonStatCard, SkeletonPostCard } from '@/components/ui/Skeleton';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { displayName, businessName, businessType } = useUser();
  const greeting = useMemo(() => getGreeting(), []);
  const fallbackEmoji = businessType
    ? getBusinessTypeInfo(businessType as BusinessType).emoji
    : '📦';

  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    const allDrafts = getDrafts();
    setDrafts(allDrafts);
    setPostCount(getPostCount());
    setStreak(getCurrentStreak());
    setScheduledCount(allDrafts.filter(d => d.scheduledFor).length);
    const reminders = getUpcomingReminders(3);
    setUpcomingReminders(reminders);
    // Auto-expand reminders section if there are upcoming reminders
    if (reminders.length > 0) {
      setRemindersOpen(true);
    }
    // Fire any overdue notifications on mount
    checkAndFireReminders();
    // Handle weekly goal rollover
    checkWeekRollover();
    setHomeLoading(false);
  }, []);

  const hasPosts = drafts.length > 0;
  const hasPublishedPosts = postCount > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
            {greeting}, {displayName}!
          </h2>
          <p className="text-brown-light text-sm mt-1">
            {businessName
              ? `Let\u2019s grow ${businessName} today.`
              : 'Let\u2019s make something great today.'}
          </p>
        </motion.div>

        {/* 1. Quick stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {homeLoading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
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
            </>
          )}
        </motion.div>

        {/* 2. Streak tracker */}
        <StreakTracker />

        {/* 3. Weekly goal tracker */}
        <GoalTracker />

        {/* 4. This Week's Plan — 5 actionable content ideas */}
        <WeeklyPlan />

        {/* 5. NudgeCard — single CTA based on what user hasn't done yet */}
        <NudgeCard />

        {/* 6. Posts list (upcoming/drafts) */}
        {homeLoading ? (
          <div className="space-y-3">
            <SkeletonPostCard />
            <SkeletonPostCard />
            <SkeletonPostCard />
          </div>
        ) : !hasPosts ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card padding="lg" className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center"
                >
                  <IoCameraOutline className="w-8 h-8 text-sage-500" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-brown font-[family-name:var(--font-heading)] mb-2">
                Your content journey starts here
              </h3>
              <p className="text-sm text-brown-light mb-5 max-w-[260px] mx-auto">
                Upload your first photo and watch the magic happen
              </p>
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
                <Link href={`/post/new?draft=${draft.id}`}>
                  <Card className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-cream-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {draft.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{fallbackEmoji}</span>
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

        {/* 6. Performance prompt — only if they have published posts */}
        {hasPublishedPosts && <PerformancePrompt />}

        {/* 7. Content idea */}
        <ContentIdea />

        {/* 8. Upcoming reminders — collapsible, auto-expanded when non-empty */}
        {upcomingReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setRemindersOpen(!remindersOpen)}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <IoCalendarOutline className="w-4 h-4 text-gold-300" />
              <h3 className="font-semibold text-brown text-sm flex-1">
                Upcoming Reminders ({upcomingReminders.length})
              </h3>
              <motion.div
                animate={{ rotate: remindersOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IoChevronDownOutline className="w-4 h-4 text-brown-light" />
              </motion.div>
            </button>
            {remindersOpen && (
              <UpcomingReminders reminders={upcomingReminders} />
            )}
          </motion.div>
        )}

        {/* 9. Tips card — collapsed by default */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="w-full text-left"
          >
            <Card className="bg-sage-50 border-sage-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
                  <IoSparklesOutline className="w-4 h-4 text-sage-600" />
                </div>
                <h4 className="text-sm font-semibold text-sage-700 flex-1 text-left">Tip of the day</h4>
                <motion.div
                  animate={{ rotate: tipsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoChevronDownOutline className="w-4 h-4 text-sage-400" />
                </motion.div>
              </div>
              {tipsOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-sage-600 leading-relaxed mt-2 pl-11 text-left"
                >
                  Photos with natural lighting and a clean background get 40% more engagement on Instagram. Try shooting near a window!
                </motion.p>
              )}
            </Card>
          </button>
        </motion.div>
      </div>

      {/* FAB — prominent with proper aria-label */}
      <Link href="/upload" aria-label="Upload a new photo">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          role="button"
          aria-label="Upload a new photo"
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-sage-500 text-white shadow-lg shadow-sage-500/30 flex items-center justify-center z-20 sm:right-[calc(50%-224px+16px)]"
        >
          <IoAddOutline className="w-7 h-7" />
        </motion.div>
      </Link>
    </AppShell>
  );
}
