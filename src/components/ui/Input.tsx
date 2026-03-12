'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-brown mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-brown placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 focus:bg-white transition-all',
            error && 'border-gold-300 focus:ring-gold-200 bg-gold-50',
            className
          )}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 text-sm text-brown bg-gold-50 rounded-lg px-3 py-1.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
