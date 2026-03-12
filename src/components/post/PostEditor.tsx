'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import PostMockup from './PostMockup';
import { IoCalendarOutline, IoAddOutline, IoCloseOutline, IoNotificationsOutline, IoExpandOutline, IoContractOutline } from 'react-icons/io5';
import { addReminder, requestNotificationPermission } from '@/lib/reminders';

interface PostEditorProps {
  initialCaption?: string;
  initialHashtags?: string[];
  initialPlatform?: string;
  imageUrl?: string;
  onCaptionChange?: (caption: string) => void;
  onHashtagsChange?: (hashtags: string[]) => void;
  onPlatformChange?: (platforms: string[]) => void;
  onScheduleChange?: (schedule: { type: 'now' | 'scheduled'; date?: string; time?: string }) => void;
}

const MAX_CAPTION_LENGTH = 2200;
const WARNING_THRESHOLD = 2000;

export default function PostEditor({
  initialCaption = '',
  initialHashtags = [],
  initialPlatform = 'Instagram',
  imageUrl,
  onCaptionChange,
  onHashtagsChange,
  onPlatformChange,
  onScheduleChange,
}: PostEditorProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [platforms, setPlatforms] = useState<string[]>([initialPlatform]);
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showMockup, setShowMockup] = useState(true);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const handleCaptionChange = (value: string) => {
    if (value.length <= MAX_CAPTION_LENGTH) {
      setCaption(value);
      onCaptionChange?.(value);
    }
  };

  const toggleHashtag = (tag: string) => {
    const next = hashtags.includes(tag)
      ? hashtags.filter(t => t !== tag)
      : [...hashtags, tag];
    setHashtags(next);
    onHashtagsChange?.(next);
  };

  const addCustomTag = () => {
    if (!newTag.trim()) return;
    const formatted = newTag.startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
    if (!hashtags.includes(formatted)) {
      const next = [...hashtags, formatted];
      setHashtags(next);
      onHashtagsChange?.(next);
    }
    setNewTag('');
  };

  const togglePlatform = (p: string) => {
    const next = platforms.includes(p)
      ? platforms.filter(x => x !== p)
      : [...platforms, p];
    if (next.length > 0) {
      setPlatforms(next);
      onPlatformChange?.(next);
    }
  };

  const handleScheduleChange = (type: 'now' | 'scheduled') => {
    setScheduleType(type);
    onScheduleChange?.({ type, date: scheduleDate, time: scheduleTime });

    // Request notification permission when user selects "Remind Me"
    if (type === 'scheduled') {
      requestNotificationPermission();
    }
  };

  const saveReminder = (date: string, time: string) => {
    if (!date || !time) return;
    const dateTime = new Date(`${date}T${time}`).toISOString();
    const preview = caption || 'Untitled post';
    addReminder({
      postId: `post-${Date.now()}`,
      dateTime,
      caption: preview,
      platforms,
    });
  };

  const charCount = caption.length;
  const charColor = charCount > WARNING_THRESHOLD
    ? charCount > MAX_CAPTION_LENGTH - 50
      ? 'text-red-500'
      : 'text-gold-400'
    : 'text-brown-light';

  return (
    <div className="space-y-4">
      {/* Mockup preview (collapsible, sticky) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10"
      >
        <button
          onClick={() => setShowMockup(!showMockup)}
          className="text-sm font-medium text-sage-500 mb-2"
        >
          {showMockup ? 'Hide preview' : 'Show preview'}
        </button>
        <AnimatePresence>
          {showMockup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <PostMockup caption={caption} hashtags={hashtags} imageUrl={imageUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="caption-editor" className="text-sm font-medium text-brown">Caption</label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${charColor}`}>{charCount}/{MAX_CAPTION_LENGTH}</span>
              <button
                type="button"
                onClick={() => setCaptionExpanded(!captionExpanded)}
                className="text-brown-light hover:text-sage-500 transition-colors"
                aria-label={captionExpanded ? 'Collapse caption' : 'Expand caption'}
              >
                {captionExpanded ? <IoContractOutline className="w-4 h-4" /> : <IoExpandOutline className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <textarea
            id="caption-editor"
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            rows={captionExpanded ? 12 : 6}
            className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-brown placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 focus:bg-white transition-all resize-none"
            placeholder="Write your caption..."
          />
        </Card>
      </motion.div>

      {/* Hashtags */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h4 className="text-sm font-medium text-brown mb-3">Hashtags</h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {initialHashtags.map((tag) => (
              <Badge
                key={tag}
                variant="sage"
                active={hashtags.includes(tag)}
                onClick={() => toggleHashtag(tag)}
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
                {!hashtags.includes(tag) && (
                  <IoCloseOutline className="w-3 h-3 ml-0.5 opacity-60" />
                )}
              </Badge>
            ))}
            {/* Custom tags that aren't in the initial list */}
            {hashtags.filter(t => !initialHashtags.includes(t)).map((tag) => (
              <Badge key={tag} variant="gold" active onClick={() => toggleHashtag(tag)}>
                {tag}
                <IoCloseOutline className="w-3 h-3 ml-0.5" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Add custom hashtag"
              aria-label="Custom hashtag"
              className="flex-1 rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-xs text-brown placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
            <button
              onClick={addCustomTag}
              aria-label="Add hashtag"
              className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-500 hover:bg-sage-100 transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Platforms */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h4 className="text-sm font-medium text-brown mb-3">Post to</h4>
          <div className="flex gap-2">
            {['Instagram', 'Pinterest', 'Facebook'].map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  platforms.includes(p)
                    ? 'bg-sage-500 text-white shadow-sm'
                    : 'bg-cream-100 text-brown-light border border-cream-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h4 className="text-sm font-medium text-brown mb-3">When to post</h4>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleScheduleChange('now')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                scheduleType === 'now'
                  ? 'bg-sage-500 text-white shadow-sm'
                  : 'bg-cream-100 text-brown-light border border-cream-200'
              }`}
            >
              Post Now
            </button>
            <button
              onClick={() => handleScheduleChange('scheduled')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                scheduleType === 'scheduled'
                  ? 'bg-sage-500 text-white shadow-sm'
                  : 'bg-cream-100 text-brown-light border border-cream-200'
              }`}
            >
              <IoNotificationsOutline className="w-4 h-4" />
              Remind Me
            </button>
          </div>
          <AnimatePresence>
            {scheduleType === 'scheduled' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="date"
                    value={scheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Reminder date"
                    onChange={(e) => {
                      setScheduleDate(e.target.value);
                      onScheduleChange?.({ type: 'scheduled', date: e.target.value, time: scheduleTime });
                      saveReminder(e.target.value, scheduleTime);
                    }}
                    className="rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-xs text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    aria-label="Reminder time"
                    onChange={(e) => {
                      setScheduleTime(e.target.value);
                      onScheduleChange?.({ type: 'scheduled', date: scheduleDate, time: e.target.value });
                      saveReminder(scheduleDate, e.target.value);
                    }}
                    className="rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-xs text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                  />
                </div>
                <p className="text-[10px] text-brown-light mt-1.5">
                  We&apos;ll remind you when it&apos;s time to post
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
