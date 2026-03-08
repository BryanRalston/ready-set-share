'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function Card({ className, padding = 'md', animate = true, children, ...props }: CardProps) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const content = (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-cream-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {content}
    </motion.div>
  );
}
