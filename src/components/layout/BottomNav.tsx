'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  IoHomeOutline, IoHome,
  IoCalendarOutline, IoCalendar,
  IoPersonOutline, IoPerson,
  IoCameraOutline, IoCamera,
  IoImagesOutline, IoImages,
} from 'react-icons/io5';

const navItems = [
  { href: '/', label: 'Home', icon: IoHomeOutline, activeIcon: IoHome },
  { href: '/upload', label: 'Upload', icon: IoCameraOutline, activeIcon: IoCamera },
  { href: '/library', label: 'Library', icon: IoImagesOutline, activeIcon: IoImages },
  { href: '/calendar', label: 'Calendar', icon: IoCalendarOutline, activeIcon: IoCalendar },
  { href: '/profile', label: 'Profile', icon: IoPersonOutline, activeIcon: IoPerson },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/80 backdrop-blur-xl border-t border-cream-200">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors',
                  isActive ? 'text-sage-500' : 'text-brown-light'
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon size={24} />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-[1px] left-3 right-3 h-0.5 bg-sage-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
