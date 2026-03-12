'use client';

import { motion } from 'framer-motion';
import { IoNotificationsOutline } from 'react-icons/io5';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title = 'Ready Set Share', showNotifications = true, rightAction }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 bg-cream-100/80 backdrop-blur-md border-b border-cream-200 z-20"
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <h1 className="text-lg font-bold text-sage-500 font-[family-name:var(--font-heading)]">
          {title}
        </h1>
        {rightAction || (showNotifications && (
          <button
            aria-label="Notifications"
            className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 hover:border-sage-200 transition-colors"
          >
            <IoNotificationsOutline size={18} />
          </button>
        ))}
      </div>
    </motion.header>
  );
}
