'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const ONBOARDING_KEY = 'wreath-social-onboarding-seen';

interface AppShellProps {
  title?: string;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ title, showNotifications, rightAction, children }: AppShellProps) {
  const pathname = usePathname();
  const { isSetup } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem(ONBOARDING_KEY);
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      <Header title={title} showNotifications={showNotifications} rightAction={rightAction} />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="max-w-md mx-auto pb-24 px-4 pt-4"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
