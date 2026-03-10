'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoCheckmarkCircle,
  IoSparkles,
  IoCopyOutline,
  IoCloseCircle,
  IoOpenOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import { canShare } from '@/lib/publisher';

interface ApproveButtonProps {
  onApprove: () => void;
  loading?: boolean;
  scheduleDate?: string;
  publishResults?: Array<{
    platform: string;
    success: boolean;
    postId?: string;
    error?: string;
  }>;
  wasShared?: boolean;
}

interface ParticleConfig {
  angle: number;
  distance: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'diamond';
  gravity: number;
  delay: number;
}

function ConfettiParticle({ config }: { config: ParticleConfig }) {
  const { angle, distance, color, size, shape, gravity, delay } = config;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance + gravity;

  const shapeClass = shape === 'circle'
    ? 'rounded-full'
    : shape === 'diamond'
    ? 'rotate-45'
    : '';

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
      animate={{
        x: [0, endX * 0.6, endX],
        y: [0, endY * 0.3 - 30, endY],
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        rotate: [0, shape === 'diamond' ? 180 : 0, shape === 'diamond' ? 360 : 0],
      }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
      className={`absolute ${shapeClass}`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    />
  );
}

export default function ApproveButton({
  onApprove,
  loading,
  scheduleDate,
  publishResults,
  wasShared,
}: ApproveButtonProps) {
  const [approved, setApproved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  const isScheduled = !!scheduleDate;
  const clipboardFailed = publishResults?.some(r => !r.success) ?? false;
  const webShareAvailable = canShare();

  // Pre-generate particle configs to avoid re-randomizing on re-render
  const particles = useMemo(() => {
    const colors = ['#7C9A6E', '#D4A574', '#A8C5A0', '#8fb284', '#637b58', '#c48f58', '#F8E8D0'];
    const shapes: ParticleConfig['shape'][] = ['circle', 'square', 'diamond'];
    const configs: ParticleConfig[] = [];

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      configs.push({
        angle,
        distance: 50 + Math.random() * 70,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 6,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        gravity: 20 + Math.random() * 40,
        delay: Math.random() * 0.15,
      });
    }
    return configs;
  }, []);

  const handleApprove = useCallback(() => {
    setShowConfetti(true);
    setShowGlow(true);
    setApproved(true);
    onApprove();
    setTimeout(() => setShowConfetti(false), 1500);
    setTimeout(() => setShowGlow(false), 2000);
  }, [onApprove]);

  // --- Determine button label based on state ---
  const getButtonLabel = (): string => {
    if (approved) {
      if (isScheduled) {
        return `Scheduled for ${scheduleDate}!`;
      }
      if (wasShared) {
        return 'Shared!';
      }
      return clipboardFailed ? 'Saved!' : 'Copied & Saved!';
    }

    // Not yet approved
    if (isScheduled) {
      return 'Schedule Post';
    }
    return webShareAvailable ? 'Share Post' : 'Approve & Copy';
  };

  const label = getButtonLabel();

  return (
    <div className="relative">
      {/* How it works — shown before approval */}
      <AnimatePresence>
        {!approved && (
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

      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
            {particles.map((config, i) => (
              <ConfettiParticle key={i} config={config} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Glow effect behind button */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="absolute -inset-2 rounded-3xl z-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(168,197,160,0.35) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleApprove}
        disabled={loading || approved}
        whileTap={!approved ? { scale: 0.92 } : undefined}
        animate={
          approved
            ? { scale: [1, 1.08, 1.03, 1] }
            : {}
        }
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`relative z-10 w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
          approved
            ? 'bg-eucalyptus text-white shadow-eucalyptus/30 shadow-md'
            : loading
            ? 'bg-sage-400 text-white/80'
            : 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sage-500/20'
        }`}
      >
        {approved ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {wasShared ? (
                <IoShareSocialOutline className="w-5 h-5" />
              ) : (
                <IoCheckmarkCircle className="w-5 h-5" />
              )}
            </motion.div>
            {label}
          </>
        ) : loading ? (
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

      {/* Publish results (clipboard status) */}
      <AnimatePresence>
        {approved && publishResults && publishResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-3 space-y-1.5 overflow-hidden"
          >
            {publishResults.map((result, i) => (
              <motion.div
                key={result.platform}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                  result.success
                    ? 'bg-sage-50 text-sage-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {wasShared ? (
                  <IoShareSocialOutline className="w-4 h-4" />
                ) : (
                  <IoCopyOutline className="w-4 h-4" />
                )}
                <span className="flex-1">
                  {result.success
                    ? wasShared
                      ? 'Post shared successfully!'
                      : 'Caption copied to clipboard — paste it into your social app!'
                    : result.error || 'Could not copy to clipboard'}
                </span>
                {result.success ? (
                  <IoCheckmarkCircle className="w-4 h-4 text-sage-500" />
                ) : (
                  <IoCloseCircle className="w-4 h-4 text-red-400" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helpful nudge */}
      <AnimatePresence>
        {!approved && (
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

      {/* Post-save nudge with direct links */}
      <AnimatePresence>
        {approved && !clipboardFailed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {wasShared ? (
              <div className="mt-3 px-4 py-3 rounded-xl bg-sage-50 border border-sage-200">
                <div className="flex items-center gap-2.5">
                  <IoShareSocialOutline className="w-4 h-4 text-sage-500 shrink-0" />
                  <p className="text-xs text-brown-light">
                    <span className="font-medium text-sage-700">Post shared!</span> Your draft has been saved.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 px-4 py-3 rounded-xl bg-sage-50 border border-sage-200">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <IoCheckmarkCircle className="w-4 h-4 text-sage-500 shrink-0" />
                  <p className="text-xs text-brown-light">
                    <span className="font-medium text-sage-700">Caption copied!</span> Now open your social media app and paste.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-sage-200 text-xs font-medium text-brown hover:bg-sage-50 transition-colors"
                  >
                    <IoOpenOutline className="w-3.5 h-3.5" />
                    Open Instagram
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-sage-200 text-xs font-medium text-brown hover:bg-sage-50 transition-colors"
                  >
                    <IoOpenOutline className="w-3.5 h-3.5" />
                    Open Pinterest
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
