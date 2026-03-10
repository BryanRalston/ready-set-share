'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import PostEditor from '@/components/post/PostEditor';
import ApproveButton from '@/components/post/ApproveButton';
import StoryCreator from '@/components/post/StoryCreator';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IoBookmarkOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { sharePost, saveDraft, getDraftById, type PublishResult } from '@/lib/publisher';
import { recordPost } from '@/lib/streak';
import { recordGoalPost } from '@/lib/goals';
import { createPerformanceEntry } from '@/lib/performance-log';

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
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [wasShared, setWasShared] = useState(false);

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
      setPublishResults(results);
      setWasShared(shared);

      // Record the post for streak tracking if share/clipboard succeeded
      if (results.some(r => r.success)) {
        recordPost();
        recordGoalPost();
        createPerformanceEntry(savedDraft.id, caption, platforms);
      }
    } catch {
      setPublishResults([{
        platform: 'clipboard',
        success: false,
        error: 'Could not copy to clipboard',
      }]);
    }

    setApproving(false);
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
    <AppShell title={id === 'new' ? 'New Post' : 'Edit Post'} rightAction={saveDraftAction} showNotifications={false}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
            publishResults={publishResults.length > 0 ? publishResults : undefined}
            wasShared={wasShared}
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
    </AppShell>
  );
}
