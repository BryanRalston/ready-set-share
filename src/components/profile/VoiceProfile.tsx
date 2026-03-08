'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import { analyzeVoice, hasEnoughEdits, getEditCount, type VoiceProfile as VoiceProfileType } from '@/lib/voice-matcher';
import { IoMicOutline, IoSparklesOutline } from 'react-icons/io5';

const TONE_EMOJIS: Record<string, string> = {
  Enthusiastic: '🎉',
  Warm: '🤗',
  Professional: '💼',
  Casual: '😊',
  Storytelling: '📖',
  Authentic: '✨',
};

function getToneEmoji(tone: string): string {
  for (const [key, emoji] of Object.entries(TONE_EMOJIS)) {
    if (tone.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '✨';
}

const traitVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.2 + i * 0.1, type: 'spring' as const, stiffness: 200, damping: 20 },
  }),
};

export default function VoiceProfileCard() {
  const [profile, setProfile] = useState<VoiceProfileType | null>(null);
  const [ready, setReady] = useState(false);
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    setEditCount(getEditCount());
    if (hasEnoughEdits()) {
      setProfile(analyzeVoice());
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  // Not enough edits — show progress
  if (!profile) {
    if (editCount === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
              <IoMicOutline className="w-5 h-5 text-sage-400" />
            </div>
            <div>
              <h3 className="font-semibold text-brown text-sm">Your Caption Voice</h3>
              <p className="text-xs text-brown-light mt-0.5 leading-relaxed">
                Edit {5 - editCount} more AI captions to unlock your voice profile. ({editCount}/5)
              </p>
              {/* Progress bar */}
              <div className="mt-2 w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(editCount / 5) * 100}%` }}
                  className="h-full bg-sage-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const traits = [
    { label: 'Tone', value: profile.tone, emoji: getToneEmoji(profile.tone) },
    { label: 'Style', value: profile.style },
    {
      label: 'Emojis',
      value: profile.emojiLevel === 'none' ? 'Clean, no emojis' : profile.emojiLevel === 'some' ? 'A few emojis' : 'Emoji-rich!',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">
            <IoMicOutline className="w-4 h-4 text-sage-500" />
          </div>
          <div>
            <h3 className="font-semibold text-brown text-sm">Your Caption Voice</h3>
            <div className="flex items-center gap-1">
              <IoSparklesOutline className="w-3 h-3 text-gold-300" />
              <span className="text-[10px] text-gold-400">AI writes captions that sound like you</span>
            </div>
          </div>
        </div>

        {/* Personality traits */}
        <div className="space-y-2.5 mb-4">
          <AnimatePresence>
            {traits.map((trait, i) => (
              <motion.div
                key={trait.label}
                custom={i}
                variants={traitVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-cream-50"
              >
                <span className="text-xs text-brown-light">{trait.label}</span>
                <span className="text-xs font-medium text-brown">
                  {trait.emoji && `${trait.emoji} `}{trait.value}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Common phrases */}
        {profile.commonPhrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <span className="text-[10px] font-medium text-brown-light uppercase tracking-wide mb-1.5 block">
              Your Go-To Phrases
            </span>
            <div className="flex flex-wrap gap-1">
              {profile.commonPhrases.map((phrase) => (
                <span
                  key={phrase}
                  className="text-[10px] bg-gold-50 text-gold-400 px-2 py-0.5 rounded-full border border-gold-200"
                >
                  &ldquo;{phrase}&rdquo;
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Before/After sample */}
        {profile.sampleBefore && profile.sampleAfter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border-t border-cream-200 pt-3"
          >
            <span className="text-[10px] font-medium text-brown-light uppercase tracking-wide mb-2 block">
              Before &amp; After
            </span>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-cream-50 border border-cream-200">
                <span className="text-[9px] text-brown-light uppercase mb-0.5 block">AI Generated</span>
                <p className="text-[11px] text-brown-light line-clamp-2">{profile.sampleBefore}</p>
              </div>
              <div className="p-2 rounded-lg bg-sage-50 border border-sage-200">
                <span className="text-[9px] text-sage-600 uppercase mb-0.5 block">Your Version</span>
                <p className="text-[11px] text-brown line-clamp-2">{profile.sampleAfter}</p>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-[10px] text-brown-light/60 mt-3 text-center">
          Based on {profile.editCount} caption edits
        </p>
      </Card>
    </motion.div>
  );
}
