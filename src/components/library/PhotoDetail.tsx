'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline, IoTrashOutline, IoCreateOutline } from 'react-icons/io5';
import { updatePhoto, deletePhoto } from '@/lib/photo-library';
import { formatDate } from '@/lib/utils';
import type { LibraryPhoto } from '@/lib/photo-library';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface PhotoDetailProps {
  photo: LibraryPhoto;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export default function PhotoDetail({ photo, onClose, onDelete, onUpdate }: PhotoDetailProps) {
  const router = useRouter();
  const [name, setName] = useState(photo.name || '');
  const [description, setDescription] = useState(photo.description || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges = name !== (photo.name || '') || description !== (photo.description || '');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updatePhoto(photo.id, { name, description });
      onUpdate();
    } catch (err) {
      console.error('Failed to update photo:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto(photo.id);
      onDelete(photo.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  const handleCreatePost = () => {
    try {
      sessionStorage.setItem('biz-social-library-photo-id', photo.id);
    } catch { /* sessionStorage may be unavailable */ }
    router.push(`/upload?fromLibrary=${photo.id}`);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brown-dark/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Detail panel */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-label="Photo Details"
        className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-cream-100">
          <h2 className="text-lg font-bold text-brown font-[family-name:var(--font-heading)]">
            Photo Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-brown-light hover:bg-cream-200 transition-colors"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Full image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100">
            <Image
              src={photo.base64.startsWith('data:') ? photo.base64 : `data:image/jpeg;base64,${photo.base64}`}
              alt={photo.name || 'Product photo'}
              fill
              className="object-cover"
            />
          </div>

          {/* Date */}
          <p className="text-xs text-brown-light/60">
            Added {formatDate(photo.createdAt)}
          </p>

          {/* Editable name */}
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give this photo a name..."
              className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-brown placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 focus:bg-white transition-all"
            />
          </div>

          {/* Editable description */}
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-brown placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Tags */}
          {photo.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sage-50 text-sage-600 border border-sage-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Save button (only visible when changes exist) */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Button onClick={handleSave} loading={saving} className="w-full">
                  Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleCreatePost}
              className="flex-1"
            >
              <IoCreateOutline className="w-4 h-4" />
              Create Post
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              size="md"
            >
              <IoTrashOutline className="w-4 h-4" />
            </Button>
          </div>

          {/* Delete confirmation */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-3">
                  <p className="text-sm text-red-700 font-medium">
                    Delete this photo permanently?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom spacer for safe area */}
          <div className="h-4" />
        </div>
      </motion.div>
    </>
  );
}
