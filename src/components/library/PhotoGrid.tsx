'use client';

import { motion } from 'framer-motion';
import { IoImageOutline } from 'react-icons/io5';
import { formatDate } from '@/lib/utils';
import type { LibraryPhoto } from '@/lib/photo-library';
import Image from 'next/image';

interface PhotoGridProps {
  photos: LibraryPhoto[];
  onSelect: (photo: LibraryPhoto) => void;
}

export default function PhotoGrid({ photos, onSelect }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(photo)}
          className="cursor-pointer"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
            <div className="relative aspect-square bg-cream-100">
              {photo.thumbnail ? (
                <Image
                  src={photo.thumbnail}
                  alt={photo.name || 'Product photo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoImageOutline className="w-10 h-10 text-brown-light/30" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-sm font-medium text-brown truncate">
                {photo.name || 'Untitled'}
              </p>
              <p className="text-[11px] text-brown-light/60 mt-0.5">
                {formatDate(photo.createdAt)}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
