'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BadgeProps {
  variant?: 'sage' | 'gold' | 'eucalyptus';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const variantStyles = {
  sage: {
    base: 'bg-sage-50 text-sage-600 border-sage-200',
    active: 'bg-sage-500 text-white border-sage-500',
  },
  gold: {
    base: 'bg-gold-50 text-gold-400 border-gold-200',
    active: 'bg-gold-300 text-white border-gold-300',
  },
  eucalyptus: {
    base: 'bg-sage-50 text-sage-500 border-sage-200',
    active: 'bg-eucalyptus text-white border-eucalyptus',
  },
};

export default function Badge({ variant = 'sage', children, className, onClick, active = false }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <motion.span
      whileTap={onClick ? { scale: 0.93 } : undefined}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors',
        active ? styles.active : styles.base,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.span>
  );
}
