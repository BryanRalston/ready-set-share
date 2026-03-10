'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  IoStatsChartOutline,
  IoStar,
  IoStarOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import {
  getUnloggedEntries,
  logPerformance,
  type PerformanceEntry,
} from '@/lib/performance-log';

export default function PerformancePrompt() {
  const [entries, setEntries] = useState<PerformanceEntry[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for the current entry
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [saves, setSaves] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const refresh = useCallback(() => {
    setEntries(getUnloggedEntries());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentEntry = entries[0];

  const resetForm = () => {
    setLikes('');
    setComments('');
    setSaves('');
    setRating(0);
    setNotes('');
  };

  const handleSave = () => {
    if (!currentEntry) return;
    setSaving(true);

    logPerformance(currentEntry.id, {
      likes: likes ? parseInt(likes, 10) : undefined,
      comments: comments ? parseInt(comments, 10) : undefined,
      saves: saves ? parseInt(saves, 10) : undefined,
      rating: rating > 0 ? (rating as 1 | 2 | 3 | 4 | 5) : undefined,
      notes: notes || undefined,
    });

    resetForm();
    // Refresh the list after a brief animation pause
    setTimeout(() => {
      refresh();
      setSaving(false);
      setDismissed(false);
    }, 300);
  };

  if (!currentEntry || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center">
              <IoStatsChartOutline className="w-4 h-4 text-brown" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brown font-[family-name:var(--font-heading)]">
                How did your post do?
              </h3>
              <p className="text-[10px] text-brown-light">
                {entries.length} post{entries.length !== 1 ? 's' : ''} to log
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-brown-light hover:text-brown hover:bg-cream-100 transition-colors"
          >
            <IoCloseOutline className="w-4 h-4" />
          </button>
        </div>

        {/* Caption preview */}
        <div className="bg-cream-50 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-brown-light line-clamp-2">
            {currentEntry.caption || 'Untitled post'}
          </p>
          <span className="text-[10px] text-sage-500 font-medium mt-0.5 inline-block">
            {currentEntry.platform}
          </span>
        </div>

        {/* Quick-log form */}
        <div className="space-y-3">
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-brown-light block mb-1">Likes</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-xs text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-1 focus:ring-sage-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-brown-light block mb-1">Comments</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-xs text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-1 focus:ring-sage-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-brown-light block mb-1">Saves</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={saves}
                onChange={(e) => setSaves(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-xs text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-1 focus:ring-sage-300"
              />
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="text-[10px] text-brown-light block mb-1">How did it feel?</label>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="p-0.5 text-gold-300 transition-transform active:scale-90"
                >
                  {star <= rating ? (
                    <IoStar className="w-5 h-5" />
                  ) : (
                    <IoStarOutline className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-brown-light block mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What worked? What didn't?"
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-2.5 py-1.5 text-xs text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-1 focus:ring-sage-300"
            />
          </div>

          {/* Save button */}
          <AnimatePresence mode="wait">
            <motion.div
              key={saving ? 'saving' : 'ready'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                size="sm"
                className="w-full"
                onClick={handleSave}
                loading={saving}
              >
                Save Results
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
