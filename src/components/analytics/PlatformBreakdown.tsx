'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getPlatformBreakdown } from '@/lib/analytics-data';
import Card from '@/components/ui/Card';

export default function PlatformBreakdown() {
  const data = getPlatformBreakdown();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <h3 className="text-sm font-semibold text-brown mb-3">Posts by Platform</h3>
        <div className="flex items-center gap-4">
          {/* Donut chart */}
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                {total}
              </span>
              <span className="text-[9px] text-brown-light">total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5">
            {data.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-xs text-brown">{platform.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-brown">{platform.value}</span>
                  <span className="text-[10px] text-brown-light">
                    ({Math.round((platform.value / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
