'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoPhonePortraitOutline, IoShareOutline, IoAddOutline, IoCloseOutline } from 'react-icons/io5';

const INSTALL_DISMISSED_KEY = 'biz-social-install-dismissed';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show prompt after a short delay for iOS (no beforeinstallprompt on Safari)
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      await deferredPromptRef.current.prompt();
      deferredPromptRef.current = null;
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brown-dark/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Prompt */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-xl max-w-md mx-auto"
          >
            <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-brown-light hover:bg-cream-200 transition-colors"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-sage-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-sage-500/20"
                >
                  <IoPhonePortraitOutline className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]"
                >
                  Get the Full Experience
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-brown-light mt-1"
                >
                  Add PostCraft to your home screen
                </motion.p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 mb-6">
                {isIOS ? (
                  // iOS instructions
                  <>
                    <StepItem
                      step={1}
                      delay={0.5}
                      icon={<IoShareOutline className="w-5 h-5" />}
                      text='Tap the Share button in Safari'
                    />
                    <StepItem
                      step={2}
                      delay={0.6}
                      icon={<IoAddOutline className="w-5 h-5" />}
                      text='Scroll down and tap "Add to Home Screen"'
                    />
                    <StepItem
                      step={3}
                      delay={0.7}
                      icon={<IoPhonePortraitOutline className="w-5 h-5" />}
                      text="Tap Add, and you're all set!"
                    />
                  </>
                ) : (
                  // Android instructions
                  <>
                    <StepItem
                      step={1}
                      delay={0.5}
                      icon={<IoAddOutline className="w-5 h-5" />}
                      text="Tap Install below to add the app"
                    />
                    <StepItem
                      step={2}
                      delay={0.6}
                      icon={<IoPhonePortraitOutline className="w-5 h-5" />}
                      text="Find PostCraft on your home screen"
                    />
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {!isIOS && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={handleInstall}
                    className="w-full py-3.5 rounded-2xl bg-sage-500 text-white font-semibold text-base hover:bg-sage-600 active:bg-sage-700 transition-colors shadow-sm"
                  >
                    Add to Home Screen
                  </motion.button>
                )}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  onClick={handleDismiss}
                  className="w-full py-3 text-sm text-brown-light hover:text-brown transition-colors"
                >
                  Maybe later
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StepItem({ step, delay, icon, text }: { step: number; delay: number; icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 bg-cream-50 rounded-xl p-3"
    >
      <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-sage-500">{step}.</span>
        <p className="text-sm text-brown">{text}</p>
      </div>
    </motion.div>
  );
}

// Type declaration for the BeforeInstallPrompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
