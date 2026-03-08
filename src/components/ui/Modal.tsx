'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brown-dark/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl p-6 max-h-[85vh] overflow-y-auto',
              'sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl',
              className
            )}
          >
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-brown-light hover:bg-cream-200 transition-colors"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
