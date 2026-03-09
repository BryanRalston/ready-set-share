'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoHeartOutline, IoChatbubbleOutline, IoPaperPlaneOutline, IoBookmarkOutline } from 'react-icons/io5';
import { useUser } from '@/lib/user-context';

interface PostMockupProps {
  caption: string;
  hashtags: string[];
  imageUrl?: string;
}

type Platform = 'instagram' | 'pinterest';

export default function PostMockup({ caption, hashtags, imageUrl }: PostMockupProps) {
  const { displayName } = useUser();
  const handle = displayName !== 'there' ? displayName.toLowerCase().replace(/\s+/g, '_') + '_shop' : 'my_shop';
  const shopName = displayName !== 'there' ? `${displayName}'s Shop` : 'My Shop';
  const initial = displayName !== 'there' ? displayName.charAt(0).toUpperCase() : 'W';
  const [platform, setPlatform] = useState<Platform>('instagram');

  return (
    <div className="space-y-3">
      {/* Platform toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setPlatform('instagram')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            platform === 'instagram'
              ? 'bg-sage-500 text-white shadow-sm'
              : 'bg-cream-200 text-brown-light'
          }`}
        >
          Instagram
        </button>
        <button
          onClick={() => setPlatform('pinterest')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            platform === 'pinterest'
              ? 'bg-sage-500 text-white shadow-sm'
              : 'bg-cream-200 text-brown-light'
          }`}
        >
          Pinterest
        </button>
      </div>

      {/* Phone frame */}
      <div className="bg-white rounded-2xl border-2 border-cream-200 overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          {platform === 'instagram' ? (
            <motion.div
              key="instagram"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Instagram header */}
              <div className="flex items-center gap-2.5 p-3 border-b border-cream-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center text-white text-xs font-bold">
                  {initial}
                </div>
                <div>
                  <p className="text-xs font-semibold text-brown">{handle}</p>
                  <p className="text-[10px] text-brown-light">{shopName}</p>
                </div>
              </div>
              {/* Image */}
              <div className="aspect-square bg-cream-100 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Post preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🌿</span>
                )}
              </div>
              {/* Actions */}
              <div className="p-3">
                <div className="flex items-center gap-4 mb-2">
                  <IoHeartOutline className="w-6 h-6 text-brown" />
                  <IoChatbubbleOutline className="w-6 h-6 text-brown" />
                  <IoPaperPlaneOutline className="w-6 h-6 text-brown" />
                  <IoBookmarkOutline className="w-6 h-6 text-brown ml-auto" />
                </div>
                <p className="text-xs text-brown mb-1">
                  <span className="font-semibold">{handle}</span>{' '}
                  {caption.slice(0, 100)}{caption.length > 100 ? '...' : ''}
                </p>
                <p className="text-[10px] text-sage-500">{hashtags.slice(0, 5).join(' ')}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pinterest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Pinterest pin format */}
              <div className="aspect-[2/3] bg-cream-100 flex items-center justify-center relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Pin preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl">🌿</span>
                )}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Save
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-brown text-sm mb-1 line-clamp-2">{caption.split('.')[0]}</h3>
                <p className="text-xs text-brown-light line-clamp-2">{caption}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-sage-200 flex items-center justify-center text-[10px] font-bold text-sage-700">{initial}</div>
                  <span className="text-[10px] text-brown-light">{shopName}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
