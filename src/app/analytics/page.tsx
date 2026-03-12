'use client';

import { motion } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import GrowthStats from '@/components/analytics/GrowthStats';
import dynamic from 'next/dynamic';
import MonthlyRecap from '@/components/analytics/MonthlyRecap';
import AnalyticsEmptyState from '@/components/analytics/AnalyticsEmptyState';
import { getMonthStats } from '@/lib/analytics-data';

const EngagementChart = dynamic(() => import('@/components/analytics/EngagementChart'), {
  loading: () => <div className="h-48 rounded-2xl bg-cream-100 animate-pulse" />,
  ssr: false,
});
const PlatformBreakdown = dynamic(() => import('@/components/analytics/PlatformBreakdown'), {
  loading: () => <div className="h-48 rounded-2xl bg-cream-100 animate-pulse" />,
  ssr: false,
});
const PostPerformance = dynamic(() => import('@/components/analytics/PostPerformance'), {
  loading: () => <div className="h-48 rounded-2xl bg-cream-100 animate-pulse" />,
  ssr: false,
});

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  const stats = getMonthStats();
  const hasData = stats.totalPosts > 0;

  if (!hasData) {
    return (
      <AppShell title="Analytics">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {/* Header */}
          <motion.div variants={item}>
            <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
              Your Growth
            </h2>
            <p className="text-sm text-brown-light mt-0.5">See how your content is performing</p>
          </motion.div>

          <motion.div variants={item}>
            <AnalyticsEmptyState />
          </motion.div>

          {/* Post performance (may have data even when no analytics data) */}
          <motion.div variants={item}>
            <PostPerformance />
          </motion.div>
        </motion.div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Analytics">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
            Your Growth
          </h2>
          <p className="text-sm text-brown-light mt-0.5">See how your content is performing</p>
        </motion.div>

        {/* Growth stats */}
        <motion.div variants={item}>
          <GrowthStats />
        </motion.div>

        {/* Engagement chart */}
        <motion.div variants={item}>
          <EngagementChart />
        </motion.div>

        {/* Platform breakdown */}
        <motion.div variants={item}>
          <PlatformBreakdown />
        </motion.div>

        {/* Monthly recap */}
        <motion.div variants={item}>
          <MonthlyRecap />
        </motion.div>

        {/* Post performance */}
        <motion.div variants={item}>
          <PostPerformance />
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
