'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import {
  IoDocumentTextOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoLinkOutline,
} from 'react-icons/io5';
import { getDrafts, deleteDraft, type PostDraft } from '@/lib/publisher';
import { getConnectedPlatforms } from '@/lib/social-accounts';
import { truncate } from '@/lib/utils';
import { useUser } from '@/lib/user-context';
import { getBusinessTypeInfo, type BusinessType } from '@/lib/business-profile';

export default function DraftsList() {
  const { businessType } = useUser();
  const fallbackEmoji = businessType
    ? getBusinessTypeInfo(businessType as BusinessType).emoji
    : '📦';
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(getDrafts());
    setConnectedPlatforms(getConnectedPlatforms());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteDraft(id);
    setDrafts(getDrafts());
    setSwipedId(null);
  }, []);

  if (drafts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-4 h-4 text-gold-300" />
          <h3 className="font-semibold text-brown text-sm">Saved Drafts</h3>
        </div>
        <span className="text-[10px] text-brown-light">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
      </div>

      <AnimatePresence mode="popLayout">
        {drafts.map((draft, i) => (
          <motion.div
            key={draft.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -200, height: 0, marginBottom: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="mb-2.5"
          >
            <Card animate={false}>
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {draft.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{fallbackEmoji}</span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brown line-clamp-2">
                    {truncate(draft.caption, 80)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {draft.hashtags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {draft.hashtags.length > 2 && (
                      <span className="text-[10px] text-brown-light">+{draft.hashtags.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/post/new?draft=${draft.id}`}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center text-sage-500 hover:bg-sage-100 transition-colors"
                    >
                      <IoCreateOutline className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  {swipedId === draft.id ? (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(draft.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSwipedId(draft.id)}
                      className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-brown-light hover:bg-cream-200 transition-colors"
                    >
                      <IoTrashOutline className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Nudge if no accounts connected */}
      {connectedPlatforms.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/profile">
            <Card className="bg-gold-50 border-gold-200 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                  <IoLinkOutline className="w-4 h-4 text-gold-400" />
                </div>
                <p className="text-xs text-brown-light">
                  <span className="font-medium text-brown">Connect your accounts</span> to post your drafts directly to Instagram, Facebook, or Pinterest.
                </p>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
