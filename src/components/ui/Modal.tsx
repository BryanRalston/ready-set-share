'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useCallback } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Manage body overflow and focus
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal container after animation
      requestAnimationFrame(() => {
        const closeBtn = modalRef.current?.querySelector<HTMLElement>('button[aria-label="Close"]');
        closeBtn?.focus();
      });
    } else {
      document.body.style.overflow = '';
      // Restore focus to the element that opened the modal
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trap focus within the modal while open
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

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
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            onKeyDown={handleKeyDown}
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
                aria-label="Close"
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
