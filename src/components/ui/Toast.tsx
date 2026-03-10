'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle } from 'react-icons/io5';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-sage-500/90 text-white border-sage-400/30',
  error: 'bg-red-500/90 text-white border-red-400/30',
  info: 'bg-gold-300/90 text-white border-gold-200/30',
};

const variantIcons: Record<ToastVariant, typeof IoCheckmarkCircle> = {
  success: IoCheckmarkCircle,
  error: IoCloseCircle,
  info: IoInformationCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    const id = ++idRef.current;
    setCurrent({ id, message, variant });

    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  }, []);

  const Icon = current ? variantIcons[current.variant] : null;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md sm:w-full">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`mx-4 mt-[env(safe-area-inset-top,12px)] mt-3 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center gap-2.5 pointer-events-auto ${variantStyles[current.variant]}`}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{current.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
