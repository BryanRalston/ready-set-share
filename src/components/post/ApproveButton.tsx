'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  IoSparkles,
  IoCopyOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import { canShare } from '@/lib/publisher';

interface ApproveButtonProps {
  onApprove: () => void;
  loading?: boolean;
  scheduleDate?: string;
}

export default function ApproveButton({
  onApprove,
  loading,
  scheduleDate,
}: ApproveButtonProps) {
  const isScheduled = !!scheduleDate;
  const webShareAvailable = canShare();

  const label = isScheduled
    ? 'Schedule Post'
    : webShareAvailable
    ? 'Share Post'
    : 'Approve & Copy';

  return (
    <div className="relative">
      {/* How it works — shown before approval */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <div className="px-4 py-3 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-xs font-semibold text-brown mb-1.5">How it works</p>
              {webShareAvailable ? (
                <ol className="text-xs text-brown-light space-y-1 list-decimal list-inside">
                  <li>Tap <span className="font-medium text-brown">Share Post</span> below</li>
                  <li>Pick your social media app</li>
                  <li>Done!</li>
                </ol>
              ) : (
                <ol className="text-xs text-brown-light space-y-1 list-decimal list-inside">
                  <li>Tap <span className="font-medium text-brown">Approve &amp; Copy</span> below</li>
                  <li>Your caption is copied to your clipboard</li>
                  <li>Open Instagram or Pinterest and paste it into a new post</li>
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onApprove}
        disabled={loading}
        whileTap={!loading ? { scale: 0.92 } : undefined}
        className={`relative z-10 w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
          loading
            ? 'bg-sage-400 text-white/80'
            : 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sage-500/20'
        }`}
      >
        {loading ? (
          <>
            <IoSparkles className="w-5 h-5 animate-pulse" />
            {webShareAvailable ? 'Sharing...' : 'Copying...'}
          </>
        ) : (
          <>
            {webShareAvailable ? (
              <IoShareSocialOutline className="w-5 h-5" />
            ) : (
              <IoCopyOutline className="w-5 h-5" />
            )}
            {label}
          </>
        )}
      </motion.button>

      {/* Helpful nudge */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gold-50 border border-gold-200">
              {webShareAvailable ? (
                <>
                  <IoShareSocialOutline className="w-4 h-4 text-gold-400 shrink-0" />
                  <p className="text-xs text-brown-light">
                    <span className="font-medium text-brown">Share directly to your social apps</span> — Instagram, Facebook, Pinterest, and more
                  </p>
                </>
              ) : (
                <>
                  <IoCopyOutline className="w-4 h-4 text-gold-400 shrink-0" />
                  <p className="text-xs text-brown-light">
                    <span className="font-medium text-brown">Caption will be copied to your clipboard</span> so you can paste it directly into Instagram, Facebook, or Pinterest
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
