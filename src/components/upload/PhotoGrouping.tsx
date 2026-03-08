'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { suggestGroupings, type PhotoInfo, type PhotoGroup } from '@/lib/photo-grouping';
import Image from 'next/image';
import {
  IoLayersOutline,
  IoCalendarOutline,
  IoImageOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';

interface PhotoGroupingProps {
  photos: PhotoInfo[];
  onUsePlan?: (groups: PhotoGroup[]) => void;
}

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  carousel: IoLayersOutline,
  spread: IoCalendarOutline,
  single: IoImageOutline,
};

function GroupCard({ group, index }: { group: PhotoGroup; index: number }) {
  const Icon = GROUP_ICONS[group.type] || IoImageOutline;
  const isCarousel = group.type === 'carousel';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCarousel ? 'bg-sage-50' : 'bg-gold-50'
          }`}>
            <Icon className={`w-4 h-4 ${isCarousel ? 'text-sage-500' : 'text-gold-400'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-brown text-sm">{group.label}</h4>
            <p className="text-[10px] text-brown-light">{group.photos.length} photos</p>
          </div>
        </div>

        {/* Photo thumbnails */}
        <div className={`flex ${isCarousel ? '-space-x-3' : 'gap-2'} mb-3`}>
          {group.photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + index * 0.15 + i * 0.08,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className={`relative rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 ${
                isCarousel ? 'w-16 h-16' : 'w-14 h-14'
              }`}
              style={isCarousel ? { zIndex: group.photos.length - i } : undefined}
            >
              <Image
                src={photo.previewUrl}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Reason */}
        <p className="text-xs text-brown-light leading-relaxed">{group.reason}</p>

        {/* Suggested date for spread groups */}
        {group.suggestedDate && (
          <div className="flex items-center gap-1.5 mt-2 py-1.5 px-2 rounded-lg bg-gold-50">
            <IoCalendarOutline className="w-3 h-3 text-gold-400" />
            <span className="text-[10px] text-gold-400 font-medium">
              Post on: {group.suggestedDate}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function PhotoGrouping({ photos, onUsePlan }: PhotoGroupingProps) {
  const suggestion = useMemo(() => suggestGroupings(photos), [photos]);

  if (photos.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <IoLayersOutline className="w-4 h-4 text-sage-500" />
        <h3 className="font-semibold text-brown text-sm font-[family-name:var(--font-heading)]">
          Smart Photo Grouping
        </h3>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-brown-light"
      >
        {suggestion.summary}
      </motion.p>

      {/* Groups */}
      <AnimatePresence>
        {suggestion.groups.map((group, i) => (
          <GroupCard key={`${group.type}-${i}`} group={group} index={i} />
        ))}
      </AnimatePresence>

      {/* Use Plan button */}
      {onUsePlan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="md"
            className="w-full gap-2"
            onClick={() => onUsePlan(suggestion.groups)}
          >
            <IoCheckmarkCircle className="w-4 h-4" />
            Use This Plan
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
