'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoImagesOutline, IoAddOutline } from 'react-icons/io5';
import AppShell from '@/components/layout/AppShell';
import PhotoGrid from '@/components/library/PhotoGrid';
import PhotoDetail from '@/components/library/PhotoDetail';
import Button from '@/components/ui/Button';
import { SkeletonPhotoCell } from '@/components/ui/Skeleton';
import { getPhotos } from '@/lib/photo-library';
import type { LibraryPhoto } from '@/lib/photo-library';
import Link from 'next/link';

export default function LibraryPage() {
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<LibraryPhoto | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      const loaded = await getPhotos();
      setPhotos(loaded);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelectedPhoto(null);
  };

  const handleUpdate = () => {
    // Reload photos to get updated data
    loadPhotos();
  };

  const handleSelect = (photo: LibraryPhoto) => {
    setSelectedPhoto(photo);
  };

  return (
    <AppShell title="Library" showNotifications={false}>
      <div className="space-y-4">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonPhotoCell key={i} />
            ))}
          </motion.div>
        )}

        {!loading && photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-sage-50 flex items-center justify-center mb-4">
              <IoImagesOutline className="w-8 h-8 text-sage-400" />
            </div>
            <h3 className="text-lg font-semibold text-brown font-[family-name:var(--font-heading)] mb-2">
              No photos yet
            </h3>
            <p className="text-sm text-brown-light max-w-[260px] mb-6">
              Your product photos will appear here. Upload your first photo to get started.
            </p>
            <Link href="/upload">
              <Button>Upload a Photo</Button>
            </Link>
          </motion.div>
        )}

        {!loading && photos.length > 0 && (
          <PhotoGrid photos={photos} onSelect={handleSelect} />
        )}
      </div>

      {/* Floating Add button */}
      {!loading && photos.length > 0 && (
        <Link href="/upload">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-sage-500 text-white shadow-lg flex items-center justify-center z-30 hover:bg-sage-600 transition-colors"
          >
            <IoAddOutline className="w-7 h-7" />
          </motion.div>
        </Link>
      )}

      {/* Photo detail overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoDetail
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
