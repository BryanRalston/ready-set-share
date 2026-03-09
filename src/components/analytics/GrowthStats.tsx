'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { getMonthStats } from '@/lib/analytics-data';
import {
  IoImageOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoStarOutline,
} from 'react-icons/io5';

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    const steps = 30;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(target, increment * step);
      setCount(current);
      if (step >= steps) {
        clearInterval(timer);
        setCount(target);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)]">
      {isDecimal ? count.toFixed(1) : Math.round(count)}
    </span>
  );
}

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function GrowthStats() {
  const stats = getMonthStats();

  const items = [
    { label: 'Total Posts', value: stats.totalPosts, icon: IoImageOutline, color: 'text-sage-500' },
    { label: 'This Month', value: stats.thisMonth, icon: IoCalendarOutline, color: 'text-gold-300' },
    { label: 'Avg / Week', value: stats.avgPerWeek, icon: IoTrendingUpOutline, color: 'text-sage-400' },
    { label: 'Best Day', value: stats.bestDay, icon: IoStarOutline, color: 'text-gold-400' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3"
    >
      {items.map((stat) => (
        <motion.div key={stat.label} variants={item}>
          <Card animate={false} padding="md" className="relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] text-brown-light font-medium">{stat.label}</span>
            </div>
            {typeof stat.value === 'number' ? (
              <AnimatedNumber target={stat.value} />
            ) : (
              <span className="text-lg font-bold text-brown font-[family-name:var(--font-heading)]">
                {stat.value}
              </span>
            )}
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
