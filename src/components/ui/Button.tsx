'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { IoReload } from 'react-icons/io5';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-300 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sm',
      secondary: 'bg-cream-200 text-brown border border-cream-200 hover:bg-gold-100 active:bg-gold-200',
      ghost: 'text-brown hover:bg-cream-200 active:bg-cream-200',
      danger: 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-7 py-3.5 text-lg gap-2',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.01 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && <IoReload className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
