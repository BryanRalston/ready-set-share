'use client';

import { motion } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import GrowthStats from '@/components/analytics/GrowthStats';
import EngagementChart from '@/components/analytics/EngagementChart';
import PlatformBreakdown from '@/components/analytics/PlatformBreakdown';
import MonthlyRecap from '@/components/analytics/MonthlyRecap';
import AnalyticsEmptyState from '@/components/analytics/AnalyticsEmptyState';
import { getMonthStats } from '@/lib/analytics-data';

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
      </motion.div>
    </AppShell>
  );
}
