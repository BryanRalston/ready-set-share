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
import { publishPost, saveDraft, type PublishResult } from '@/lib/publisher';

// Mock post data — in production this would come from localStorage or state
const MOCK_POST = {
  caption: 'Beautiful handcrafted wreath, made with love! Every detail is carefully chosen to bring warmth to your home.',
  hashtags: ['#wreath', '#handmade', '#homedecor', '#wreathmaking', '#crafts', '#doorwreath', '#seasonal', '#naturaldecor', '#homestyle', '#shopsmall'],
  platform: 'Instagram',
  tip: 'Post between 11am-1pm for best engagement.',
  postType: 'Single Post',
  imageUrl: '', // In production, from upload flow
};

export default function PostPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [approving, setApproving] = useState(false);
  const [createStory, setCreateStory] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);

  const handleApprove = async () => {
    setApproving(true);

    const postData = {
      caption: MOCK_POST.caption,
      hashtags: MOCK_POST.hashtags,
      imageUrl: MOCK_POST.imageUrl || undefined,
      platforms: [] as string[],
      scheduledFor: scheduleType === 'scheduled' ? scheduleDate : undefined,
    };

    // Always copy to clipboard + save as draft
    saveDraft(postData);

    try {
      const { results } = await publishPost(postData);
      setPublishResults(results);
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
          initialCaption={MOCK_POST.caption}
          initialHashtags={MOCK_POST.hashtags}
          initialPlatform={MOCK_POST.platform}
          imageUrl={MOCK_POST.imageUrl || undefined}
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
          {createStory && MOCK_POST.imageUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <StoryCreator imageUrl={MOCK_POST.imageUrl} />
            </motion.div>
          )}
          {createStory && !MOCK_POST.imageUrl && (
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
