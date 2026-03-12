'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import {
  IoCheckmarkCircle,
  IoCheckmarkOutline,
  IoRefreshOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import { useUser } from '@/lib/user-context';
import {
  getOrCreateWeeklyPlan,
  markPlanItemComplete,
  regenerateWeeklyPlan,
  type WeeklyPlan as WeeklyPlanType,
  type PlanItem,
} from '@/lib/weekly-plan';

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-sage-500',
  'behind-scenes': 'bg-gold-300',
  educational: 'bg-sage-400',
  engagement: 'bg-gold-200',
  promotion: 'bg-sage-600',
  seasonal: 'bg-gold-400',
};

const PLATFORM_STYLES: Record<string, string> = {
  Instagram: 'bg-sage-50 text-sage-600',
  Pinterest: 'bg-gold-50 text-gold-400',
  Facebook: 'bg-cream-100 text-brown-light',
};

export default function WeeklyPlan() {
  const { businessType, businessName } = useUser();
  const [plan, setPlan] = useState<WeeklyPlanType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const loadPlan = useCallback(() => {
    const p = getOrCreateWeeklyPlan(businessType || undefined, businessName || undefined);
    setPlan(p);
  }, [businessType, businessName]);

  useEffect(() => {
    loadPlan();
    setMounted(true);
  }, [loadPlan]);

  const handleToggle = (itemId: string) => {
    if (!plan) return;
    const updated = markPlanItemComplete(plan.id, itemId);
    if (updated) setPlan({ ...updated });
  };

  const handleRefresh = () => {
    setSpinning(true);
    const newPlan = regenerateWeeklyPlan(businessType || undefined, businessName || undefined);
    setPlan(newPlan);
    setTimeout(() => setSpinning(false), 600);
  };

  if (!mounted || !plan) return null;

  const completedCount = plan.items.filter(i => i.completed).length;
  const totalCount = plan.items.length;
  const allDone = completedCount === totalCount;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card padding="md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-semibold text-brown font-[family-name:var(--font-heading)]">
              This Week&apos;s Plan
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brown-light font-medium">
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={handleRefresh}
              className="p-1 rounded-full hover:bg-cream-100 transition-colors"
              aria-label="Refresh plan"
            >
              <motion.div
                animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <IoRefreshOutline className="w-4 h-4 text-brown-light" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className={`h-full rounded-full ${allDone ? 'bg-sage-500' : 'bg-sage-400'}`}
          />
        </div>

        {/* Celebration */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2 bg-sage-50 rounded-xl py-2.5 px-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-base"
                >
                  🎉
                </motion.span>
                <span className="text-xs font-semibold text-sage-600">
                  All done this week! You&apos;re crushing it.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan items */}
        <div className="space-y-1">
          {plan.items.map((item, i) => (
            <PlanItemRow
              key={item.id}
              item={item}
              index={i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function PlanItemRow({
  item,
  index,
  onToggle,
}: {
  item: PlanItem;
  index: number;
  onToggle: (id: string) => void;
}) {
  const dotColor = TYPE_COLORS[item.type] || 'bg-sage-400';
  const platformStyle = PLATFORM_STYLES[item.platform] || 'bg-cream-100 text-brown-light';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`flex items-center gap-2.5 py-2.5 px-2 rounded-xl transition-colors ${
        item.completed ? 'bg-cream-100/50' : 'hover:bg-cream-50'
      }`}
    >
      {/* Check button */}
      <button
        onClick={() => onToggle(item.id)}
        className="shrink-0 flex items-center justify-center"
        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <AnimatePresence mode="wait">
          {item.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <IoCheckmarkCircle className="w-5 h-5 text-sage-500" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-5 h-5 rounded-full border-2 border-cream-200"
            />
          )}
        </AnimatePresence>
      </button>

      {/* Content — tappable to go create */}
      <Link href="/upload" className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {/* Day dot + label */}
          <div className="flex flex-col items-center shrink-0 w-8 pt-0.5">
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-[9px] font-semibold text-brown-light mt-0.5 uppercase tracking-wide">
              {item.dayName.slice(0, 3)}
            </span>
          </div>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-semibold leading-tight ${
                item.completed ? 'text-brown-light line-through' : 'text-brown'
              }`}
            >
              {item.title}
            </p>
            <p
              className={`text-[10px] leading-snug mt-0.5 ${
                item.completed ? 'text-brown-light/60 line-through' : 'text-brown-light'
              }`}
            >
              {item.description}
            </p>
          </div>
        </div>
      </Link>

      {/* Platform badge + arrow */}
      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${platformStyle}`}>
          {item.platform === 'Instagram' ? 'IG' : item.platform === 'Pinterest' ? 'Pin' : 'FB'}
        </span>
        {!item.completed && (
          <IoChevronForwardOutline className="w-3 h-3 text-cream-200" />
        )}
        {item.completed && (
          <IoCheckmarkOutline className="w-3 h-3 text-sage-400" />
        )}
      </div>
    </motion.div>
  );
}
