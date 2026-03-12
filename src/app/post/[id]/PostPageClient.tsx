'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import PostEditor from '@/components/post/PostEditor';
import ApproveButton from '@/components/post/ApproveButton';
import StoryCreator from '@/components/post/StoryCreator';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  IoBookmarkOutline,
  IoPhonePortraitOutline,
  IoLogoInstagram,
  IoLogoPinterest,
  IoLogoFacebook,
  IoLogoTiktok,
  IoCheckmarkCircle,
  IoAddCircleOutline,
  IoHomeOutline,
  IoCopyOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { sharePost, saveDraft, getDraftById, type PublishResult } from '@/lib/publisher';
import { recordPost, getCurrentStreak, getMilestone } from '@/lib/streak';
import { recordGoalPost } from '@/lib/goals';
import { createPerformanceEntry } from '@/lib/performance-log';
import { recordPost as recordPostAnalytics } from '@/lib/posting-analytics';

// Fallback data — used only when no pending post or draft is found
const MOCK_POST = {
  caption: 'Check out our latest creation! Made with love and care. Every detail matters when you pour your heart into your craft.',
  hashtags: ['#handmade', '#smallbusiness', '#shopsmall', '#madewithcare', '#supportsmall', '#handcrafted', '#shoplocal', '#makersofinstagram', '#smallbiz', '#buylocal'],
  platform: 'Instagram',
  tip: 'Post between 11am-1pm for best engagement.',
  postType: 'Single Post',
  imageUrl: '',
};

function loadPostData(id: string) {
  if (id === 'new') {
    // Try loading from sessionStorage (set by the upload flow)
    try {
      const raw = sessionStorage.getItem('biz-social-pending-post');
      if (raw) {
        sessionStorage.removeItem('biz-social-pending-post');
        const parsed = JSON.parse(raw);
        return {
          caption: parsed.caption || '',
          hashtags: parsed.hashtags || [],
          platform: parsed.platform || 'Instagram',
          tip: parsed.tip || '',
          postType: parsed.postType || 'Single Post',
          imageUrl: parsed.imageUrl || '',
        };
      }
    } catch { /* sessionStorage may be unavailable */ }
    // No pending post — return empty editor
    return { caption: '', hashtags: [], platform: 'Instagram', tip: '', postType: 'Single Post', imageUrl: '' };
  }

  // Try loading a saved draft by ID
  const draft = getDraftById(id);
  if (draft) {
    return {
      caption: draft.caption,
      hashtags: draft.hashtags,
      platform: 'Instagram',
      tip: '',
      postType: 'Single Post',
      imageUrl: draft.imageUrl || '',
    };
  }

  // Nothing found — fall back to mock
  return MOCK_POST;
}

// --- Celebration confetti particles (framer-motion only) ---

interface ConfettiConfig {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'diamond';
  gravity: number;
  delay: number;
}

function CelebrationConfetti({ particles }: { particles: ConfettiConfig[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      {particles.map((p) => {
        const endX = Math.cos(p.angle) * p.distance;
        const endY = Math.sin(p.angle) * p.distance + p.gravity;
        const shapeClass = p.shape === 'circle'
          ? 'rounded-full'
          : p.shape === 'diamond'
          ? 'rotate-45'
          : '';

        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: [0, endX * 0.5, endX],
              y: [0, endY * 0.2 - 60, endY],
              scale: [0, 1.4, 0],
              opacity: [1, 1, 0],
              rotate: [0, p.shape === 'diamond' ? 180 : 90, p.shape === 'diamond' ? 360 : 180],
            }}
            transition={{
              duration: 1.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: p.delay,
            }}
            className={`absolute ${shapeClass}`}
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
            }}
          />
        );
      })}
    </div>
  );
}

// --- Animated checkmark ---

function AnimatedCheckmark() {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* Pulsing glow ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 0.4, 0.2] }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,197,160,0.5) 0%, transparent 70%)' }}
      />
      {/* Circle background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        className="absolute inset-0 rounded-full bg-eucalyptus flex items-center justify-center"
      >
        {/* Checkmark SVG */}
        <motion.svg
          viewBox="0 0 24 24"
          className="w-10 h-10"
          initial="hidden"
          animate="visible"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1 },
            }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}

// --- Platform toggle button ---

const PLATFORM_CONFIG = [
  { key: 'instagram', label: 'Instagram', icon: IoLogoInstagram, color: '#E4405F' },
  { key: 'pinterest', label: 'Pinterest', icon: IoLogoPinterest, color: '#BD081C' },
  { key: 'facebook', label: 'Facebook', icon: IoLogoFacebook, color: '#1877F2' },
  { key: 'tiktok', label: 'TikTok', icon: IoLogoTiktok, color: '#000000' },
];

function PlatformToggle({
  platform,
  active,
  onToggle,
  delay,
}: {
  platform: typeof PLATFORM_CONFIG[number];
  active: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const Icon = platform.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-all ${
        active
          ? 'border-sage-500 bg-sage-50 shadow-sm'
          : 'border-cream-200 bg-white hover:border-cream-200 hover:bg-cream-50'
      }`}
    >
      {/* Active checkmark badge */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center"
          >
            <IoCheckmarkCircle className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <Icon
        className="w-7 h-7 transition-colors"
        style={{ color: active ? platform.color : '#9CA3AF' }}
      />
      <span className={`text-xs font-medium transition-colors ${
        active ? 'text-brown' : 'text-brown-light'
      }`}>
        {platform.label}
      </span>
    </motion.button>
  );
}

// --- Celebration Screen ---

function CelebrationScreen({
  caption,
  hashtags,
  wasShared,
  clipboardFailed,
  onCreateAnother,
  onGoHome,
}: {
  caption: string;
  hashtags: string[];
  wasShared: boolean;
  clipboardFailed: boolean;
  onCreateAnother: () => void;
  onGoHome: () => void;
}) {
  const [postedPlatforms, setPostedPlatforms] = useState<Set<string>>(new Set());

  // Get streak data
  const streak = getCurrentStreak();
  const milestone = getMilestone(streak);

  // Generate confetti particles once
  const particles = useMemo(() => {
    const colors = ['#7C9A6E', '#D4A574', '#A8C5A0', '#8fb284', '#637b58', '#c48f58', '#F8E8D0', '#A8D89A', '#F0C87A'];
    const shapes: ConfettiConfig['shape'][] = ['circle', 'square', 'diamond'];
    const configs: ConfettiConfig[] = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      configs.push({
        id: i,
        angle,
        distance: 80 + Math.random() * 120,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 8,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        gravity: 30 + Math.random() * 60,
        delay: Math.random() * 0.3,
      });
    }
    return configs;
  }, []);

  const togglePlatform = useCallback((platformKey: string) => {
    setPostedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platformKey)) {
        next.delete(platformKey);
      } else {
        next.add(platformKey);
        // Record to posting analytics when toggled ON
        recordPostAnalytics(platformKey);
      }
      return next;
    });
  }, []);

  // Build a truncated preview of the caption
  const previewCaption = caption.length > 120
    ? caption.slice(0, 120) + '...'
    : caption;

  const hashtagPreview = hashtags.slice(0, 5).join(' ');
  const moreHashtags = hashtags.length > 5 ? ` +${hashtags.length - 5} more` : '';

  return (
    <motion.div
      key="celebration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center px-2 py-4 min-h-[60vh]"
    >
      {/* Confetti burst */}
      <div className="relative w-full flex justify-center mb-6">
        <CelebrationConfetti particles={particles} />
        <AnimatedCheckmark />
      </div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-brown text-center mb-1"
      >
        Your post is ready!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-brown-light text-center mb-6"
      >
        {wasShared
          ? 'Shared to your social app'
          : clipboardFailed
          ? 'Your draft has been saved'
          : 'Caption copied to clipboard'}
      </motion.p>

      {/* Clipboard failure note */}
      {clipboardFailed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full mb-4"
        >
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gold-50 border border-gold-200">
            <IoWarningOutline className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <p className="text-xs text-brown-light">
              Automatic copy didn&apos;t work this time. Long-press the caption below to copy it manually.
            </p>
          </div>
        </motion.div>
      )}

      {/* Caption preview card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full mb-5"
      >
        <Card padding="md">
          <p className="text-sm text-brown leading-relaxed select-all">{previewCaption}</p>
          {hashtags.length > 0 && (
            <p className="text-xs text-sage-500 mt-2 select-all">
              {hashtagPreview}
              {moreHashtags && <span className="text-brown-light">{moreHashtags}</span>}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Streak celebration */}
      {streak > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
          className="w-full mb-5"
        >
          <div className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-gold-50 to-cream-50 border border-gold-200">
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: 2, duration: 0.6, delay: 0.8 }}
              className="text-2xl"
            >
              {milestone ? milestone.icon : '\uD83D\uDD25'}
            </motion.span>
            <div>
              <p className="text-base font-bold text-brown">
                {streak} day streak!
              </p>
              {milestone && (
                <p className="text-xs text-gold-400 font-medium">{milestone.name}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* "I posted it to:" platform toggles */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full mb-6"
      >
        <p className="text-sm font-semibold text-brown mb-3 text-center">
          I posted it to:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORM_CONFIG.map((platform, idx) => (
            <PlatformToggle
              key={platform.key}
              platform={platform}
              active={postedPlatforms.has(platform.key)}
              onToggle={() => togglePlatform(platform.key)}
              delay={0.75 + idx * 0.06}
            />
          ))}
        </div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="w-full space-y-3"
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onCreateAnother}
        >
          <IoAddCircleOutline className="w-5 h-5" />
          Create Another Post
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="w-full"
          onClick={onGoHome}
        >
          <IoHomeOutline className="w-5 h-5" />
          Go Home
        </Button>
      </motion.div>
    </motion.div>
  );
}

// --- Main Component ---

export default function PostPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [postData] = useState(() => loadPostData(id));
  const [caption, setCaption] = useState(postData.caption);
  const [hashtags, setHashtags] = useState<string[]>(postData.hashtags);
  const [platforms, setPlatforms] = useState<string[]>([postData.platform]);
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [approving, setApproving] = useState(false);
  const [createStory, setCreateStory] = useState(false);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasShared, setWasShared] = useState(false);
  const [clipboardFailed, setClipboardFailed] = useState(false);

  const handleApprove = async () => {
    setApproving(true);

    const publishPayload = {
      caption,
      hashtags,
      imageUrl: postData.imageUrl || undefined,
      platforms,
      scheduledFor: scheduleType === 'scheduled' ? scheduleDate : undefined,
    };

    // Always copy to clipboard + save as draft (pass existing id for drafts)
    const savedDraft = saveDraft(publishPayload, id !== 'new' ? id : undefined);

    try {
      const { results, shared } = await sharePost(publishPayload);
      setWasShared(shared);

      const anySuccess = results.some(r => r.success);
      setClipboardFailed(!anySuccess);

      // Record the post for streak tracking if share/clipboard succeeded
      if (anySuccess) {
        recordPost();
        recordGoalPost();
        createPerformanceEntry(savedDraft.id, caption, platforms);
      }
    } catch {
      setClipboardFailed(true);
    }

    setApproving(false);
    // Always show celebration — even on clipboard failure, the draft is saved
    setShowCelebration(true);
  };

  const saveDraftAction = (
    <button
      onClick={() => router.push('/')}
      className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors"
    >
      <IoBookmarkOutline size={18} />
    </button>
  );

  return (
    <AppShell
      title={showCelebration ? 'Done!' : id === 'new' ? 'New Post' : 'Edit Post'}
      rightAction={showCelebration ? undefined : saveDraftAction}
      showNotifications={false}
    >
      <AnimatePresence mode="wait">
        {!showCelebration ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <PostEditor
              initialCaption={postData.caption}
              initialHashtags={postData.hashtags}
              initialPlatform={postData.platform}
              imageUrl={postData.imageUrl || undefined}
              onCaptionChange={setCaption}
              onHashtagsChange={setHashtags}
              onPlatformChange={setPlatforms}
              onScheduleChange={(s) => {
                setScheduleType(s.type);
                if (s.date) setScheduleDate(s.date);
              }}
            />

            {/* Story toggle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <IoPhonePortraitOutline className="w-5 h-5 text-sage-500" />
                    <span className="text-sm text-brown">Also create a Story?</span>
                  </div>
                  <button
                    onClick={() => setCreateStory(!createStory)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      createStory ? 'bg-sage-500' : 'bg-cream-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: createStory ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              </Card>
            </motion.div>

            <AnimatePresence>
              {createStory && postData.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <StoryCreator imageUrl={postData.imageUrl} />
                </motion.div>
              )}
              {createStory && !postData.imageUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="text-center">
                    <p className="text-sm text-brown-light">
                      Upload a photo first to create a Story version.
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 pt-2">
              <ApproveButton
                onApprove={handleApprove}
                loading={approving}
                scheduleDate={scheduleType === 'scheduled' ? scheduleDate : undefined}
              />
              <Button
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        ) : (
          <CelebrationScreen
            caption={caption}
            hashtags={hashtags}
            wasShared={wasShared}
            clipboardFailed={clipboardFailed}
            onCreateAnother={() => router.push('/upload')}
            onGoHome={() => router.push('/')}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
