'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  IoSparkles,
  IoLogoInstagram,
  IoLogoPinterest,
  IoBulbOutline,
  IoLayersOutline,
  IoImageOutline,
} from 'react-icons/io5';

export interface AnalysisResult {
  caption: string;
  hashtags: string[];
  platform: string;
  tip: string;
  postType: string;
}

interface AIAnalysisProps {
  loading?: boolean;
  result?: AnalysisResult | null;
  imageUrl?: string;
  onCreatePost?: () => void;
  onSaveForLater?: () => void;
}

function LoadingState() {
  return (
    <Card padding="lg" className="text-center">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative w-16 h-16">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-sage-300"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <IoSparkles className="w-7 h-7 text-gold-300" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-brown">Analyzing your wreath...</p>
          <p className="text-sm text-brown-light mt-1">AI is crafting the perfect post</p>
        </div>
      </div>
    </Card>
  );
}

export default function AIAnalysis({ loading, result, onCreatePost, onSaveForLater }: AIAnalysisProps) {
  if (loading) return <LoadingState />;
  if (!result) return null;

  const PlatformIcon = result.platform.toLowerCase().includes('pinterest')
    ? IoLogoPinterest
    : IoLogoInstagram;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Caption */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <IoSparkles className="w-5 h-5 text-gold-300" />
          <h3 className="font-semibold text-brown font-[family-name:var(--font-heading)]">Caption</h3>
        </div>
        <p className="text-sm text-brown leading-relaxed whitespace-pre-wrap">{result.caption}</p>
      </Card>

      {/* Hashtags */}
      <Card>
        <h4 className="font-medium text-brown mb-3 text-sm">Hashtags</h4>
        <div className="flex flex-wrap gap-1.5">
          {result.hashtags.map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <Badge variant="sage">{tag.startsWith('#') ? tag : `#${tag}`}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Platform + Post Type */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <PlatformIcon className="w-6 h-6 text-sage-500 mx-auto mb-1" />
          <p className="text-xs text-brown-light">Best Platform</p>
          <p className="text-sm font-semibold text-brown">{result.platform}</p>
        </Card>
        <Card padding="sm" className="text-center">
          {result.postType.toLowerCase().includes('carousel')
            ? <IoLayersOutline className="w-6 h-6 text-gold-300 mx-auto mb-1" />
            : <IoImageOutline className="w-6 h-6 text-gold-300 mx-auto mb-1" />}
          <p className="text-xs text-brown-light">Use as</p>
          <p className="text-sm font-semibold text-brown">{result.postType}</p>
        </Card>
      </div>

      {/* Tip */}
      <Card className="bg-gold-50 border-gold-200">
        <div className="flex items-start gap-2.5">
          <IoBulbOutline className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gold-400 mb-0.5">Posting Tip</p>
            <p className="text-sm text-brown leading-relaxed">{result.tip}</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button size="lg" className="w-full gap-2" onClick={onCreatePost}>
          <IoSparkles className="w-4 h-4" />
          Create Post
        </Button>
        <Button variant="secondary" size="md" className="w-full" onClick={onSaveForLater}>
          Save for Later
        </Button>
      </div>
    </motion.div>
  );
}
