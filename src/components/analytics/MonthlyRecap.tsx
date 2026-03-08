'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { getMonthlyRecapData } from '@/lib/analytics-data';
import Button from '@/components/ui/Button';
import {
  IoShareOutline,
  IoFlameOutline,
  IoTrophyOutline,
  IoPricetagOutline,
} from 'react-icons/io5';

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function MonthlyRecap() {
  const recap = getMonthlyRecapData();

  const handleShareRecap = useCallback(async () => {
    // Create a canvas image for sharing
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#7C9A6E');
    gradient.addColorStop(1, '#A8C5A0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Title
    ctx.fillStyle = '#FFFCF7';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`My ${recap.month} Recap`, 540, 200);

    // Stats
    ctx.font = '36px sans-serif';
    ctx.fillText(`${recap.postsThisMonth} posts this month`, 540, 360);
    ctx.fillText(`${recap.streakRecord} day streak`, 540, 440);
    ctx.fillText(`${recap.totalReach} total reach`, 540, 520);

    // Best post
    ctx.font = 'italic 28px sans-serif';
    ctx.fillStyle = '#FFFCF7DD';
    ctx.fillText('Best post:', 540, 660);
    ctx.font = '24px sans-serif';
    const words = recap.bestPost.caption.split(' ');
    let line = '';
    let y = 710;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 800) {
        ctx.fillText(line.trim(), 540, y);
        line = word + ' ';
        y += 36;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), 540, y);

    // Footer
    ctx.fillStyle = '#FFFCF770';
    ctx.font = '22px sans-serif';
    ctx.fillText('Made with Wreath Social', 540, 1020);

    // Share or download
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${recap.month.toLowerCase()}-recap.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `My ${recap.month} Wreath Recap`,
            files: [file],
          });
        } catch {
          // User cancelled
        }
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recap.month.toLowerCase()}-recap.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }, [recap]);

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-2xl overflow-hidden shadow-sm">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-sage-500 to-sage-300 px-5 pt-5 pb-4">
          <motion.h3
            variants={itemVariants}
            className="text-lg font-bold text-white font-[family-name:var(--font-heading)]"
          >
            Your {recap.month} Recap
          </motion.h3>
          <motion.p variants={itemVariants} className="text-sage-100 text-xs mt-0.5">
            Here&apos;s how you did this month
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="bg-white px-5 py-4 space-y-3 border-x border-cream-200">
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                {recap.postsThisMonth}
              </p>
              <p className="text-[10px] text-brown-light">Posts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <IoFlameOutline className="w-4 h-4 text-gold-300" />
                <p className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                  {recap.streakRecord}
                </p>
              </div>
              <p className="text-[10px] text-brown-light">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                {recap.totalReach}
              </p>
              <p className="text-[10px] text-brown-light">Reach</p>
            </div>
          </motion.div>

          {/* Best post */}
          <motion.div variants={itemVariants} className="bg-cream-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <IoTrophyOutline className="w-3.5 h-3.5 text-gold-300" />
              <span className="text-[10px] font-semibold text-gold-400">Best Post</span>
            </div>
            <p className="text-xs text-brown line-clamp-2">{recap.bestPost.caption}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full">
                {recap.bestPost.platform}
              </span>
              <span className="text-[10px] text-brown-light">
                {recap.bestPost.engagement} engagements
              </span>
            </div>
          </motion.div>

          {/* Top hashtag */}
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <IoPricetagOutline className="w-4 h-4 text-sage-400" />
            <span className="text-xs text-brown-light">Top hashtag:</span>
            <span className="text-xs font-semibold text-sage-600">{recap.topHashtag}</span>
          </motion.div>
        </div>

        {/* Share button */}
        <div className="bg-white px-5 py-3 border border-cream-200 rounded-b-2xl">
          <motion.div variants={itemVariants}>
            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2"
              onClick={handleShareRecap}
            >
              <IoShareOutline className="w-4 h-4" />
              Share My Recap
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
