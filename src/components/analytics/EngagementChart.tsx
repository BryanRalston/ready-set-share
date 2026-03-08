'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getWeeklyPostData } from '@/lib/analytics-data';
import Card from '@/components/ui/Card';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-cream-200 px-3 py-2">
      <p className="text-[10px] text-brown-light">{label}</p>
      <p className="text-sm font-bold text-sage-600">{payload[0].value} posts</p>
    </div>
  );
}

export default function EngagementChart() {
  const data = getWeeklyPostData();

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Card>
        <h3 className="text-sm font-semibold text-brown mb-3">Posts Over Time</h3>
        <div className="h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C9A6E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C9A6E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: '#8B6F5A' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#8B6F5A' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="posts"
                stroke="#7C9A6E"
                strokeWidth={2.5}
                fill="url(#sageGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#7C9A6E', stroke: '#FDF6EC', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
