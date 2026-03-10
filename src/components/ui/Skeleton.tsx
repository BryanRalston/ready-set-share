'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle';
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({ variant = 'text', className, width, height }: SkeletonProps) {
  const base = 'animate-pulse bg-sage-100 dark:bg-dark-border';

  const variants = {
    text: 'h-4 rounded-full',
    card: 'rounded-2xl',
    circle: 'rounded-full',
  };

  const defaultSizes = {
    text: { width: '100%', height: undefined },
    card: { width: '100%', height: '120px' },
    circle: { width: '48px', height: '48px' },
  };

  const defaults = defaultSizes[variant];

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{
        width: width ?? defaults.width,
        height: height ?? defaults.height,
      }}
    />
  );
}

/** Pre-composed skeleton for a stat card */
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-4 space-y-2">
      <Skeleton variant="circle" width="20px" height="20px" />
      <Skeleton variant="text" width="60%" height="24px" />
      <Skeleton variant="text" width="40%" height="10px" />
    </div>
  );
}

/** Pre-composed skeleton for a post/draft card */
export function SkeletonPostCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-4 flex items-start gap-3">
      <Skeleton variant="card" width="56px" height="56px" className="rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton variant="text" width="85%" height="14px" />
        <Skeleton variant="text" width="50%" height="10px" />
      </div>
    </div>
  );
}

/** Pre-composed skeleton for a photo grid cell */
export function SkeletonPhotoCell() {
  return (
    <Skeleton variant="card" className="aspect-square rounded-xl" height="auto" />
  );
}

/** Pre-composed skeleton for an analytics chart area */
export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-4 space-y-3">
      <Skeleton variant="text" width="40%" height="14px" />
      <Skeleton variant="card" height="192px" />
    </div>
  );
}
