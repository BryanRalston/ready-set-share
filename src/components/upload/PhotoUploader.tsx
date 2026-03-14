'use client';

import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCameraOutline, IoCloseCircle } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PhotoUploaderProps {
  onPhotoSelected: (file: File) => void;
  previewUrl?: string | null;
  onClear?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
  onChooseFromLibrary?: () => void;
}

export default function PhotoUploader({ onPhotoSelected, previewUrl, onClear, uploading, uploadProgress = 0, onChooseFromLibrary }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onPhotoSelected(file);
      }
    },
    [onPhotoSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
    }
    // Reset so selecting the same file again still triggers onChange
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (previewUrl) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative rounded-2xl overflow-hidden shadow-md"
      >
        <div className="relative aspect-square bg-cream-200">
          <Image
            src={previewUrl}
            alt="Selected photo"
            fill
            className="object-cover"
          />
        </div>
        {onClear && !uploading && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClear}
            aria-label="Remove photo"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brown-light hover:text-brown shadow-sm"
          >
            <IoCloseCircle className="w-6 h-6" />
          </motion.button>
        )}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-cream-200/80">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-sage-500 rounded-r-full"
            />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <>
    <div
      onClick={() => {
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.click();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 rounded-2xl border-2 border-dashed cursor-pointer transition-all active:scale-[0.98]',
        isDragging
          ? 'border-sage-400 bg-sage-50 scale-[1.02]'
          : 'border-sage-300/50 bg-white hover:border-sage-400 hover:bg-cream-50'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-full bg-sage-50 flex items-center justify-center transition-transform',
          isDragging && 'scale-110 -translate-y-1'
        )}
      >
        <IoCameraOutline className="w-8 h-8 text-sage-400" />
      </div>
      <div className="text-center">
        <p className="font-medium text-brown">Tap to choose a photo</p>
        <p className="text-sm text-brown-light/60 mt-1">PNG, JPG up to 10MB</p>
      </div>
    </div>
    <input
      ref={inputRef}
      id="photo-upload-input"
      type="file"
      accept="image/*"
      onChange={handleChange}
      aria-label="Upload a photo"
      className="sr-only"
    />
    {onChooseFromLibrary && (
      <button
        onClick={onChooseFromLibrary}
        className="block w-full text-center mt-3 text-sm text-sage-500 hover:text-sage-600 transition-colors"
      >
        or choose from library
      </button>
    )}
    </>
  );
}
