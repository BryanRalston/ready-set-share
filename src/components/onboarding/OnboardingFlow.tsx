'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useUser } from '@/lib/user-context';
import {
  IoCameraOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoOpenOutline,
} from 'react-icons/io5';

const ONBOARDING_KEY = 'wreath-social-onboarding-seen';
const TOTAL_STEPS = 5;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { updatePreferences } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1 state — name
  const [name, setName] = useState('');

  // Step 2 state — API key
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const finishOnboarding = useCallback(() => {
    updatePreferences({ setupComplete: true });
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  }, [updatePreferences, onComplete]);

  const handleNext = useCallback(() => {
    // Step-specific save logic before advancing
    if (currentStep === 1 && name.trim()) {
      updatePreferences({ displayName: name.trim() });
    }
    if (currentStep === 2 && apiKey.trim()) {
      updatePreferences({ geminiApiKey: apiKey.trim() });
    }

    if (currentStep === TOTAL_STEPS - 1) {
      finishOnboarding();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, [currentStep, name, apiKey, updatePreferences, finishOnboarding]);

  const handleSkip = useCallback(() => {
    finishOnboarding();
  }, [finishOnboarding]);

  const handleSkipApiKey = useCallback(() => {
    // Move past the API key step without saving a key
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, []);

  const isLast = currentStep === TOTAL_STEPS - 1;

  // Determine whether "Next" should be disabled on the current step
  const isNextDisabled = currentStep === 1 && !name.trim();

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="text-7xl"
        >
          🌿
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        Welcome to Wreath Social!
      </h2>
      <p className="text-sm text-brown-light leading-relaxed">
        Your AI-powered assistant for growing your wreath business on social media.
      </p>
    </div>
  );

  const renderNameStep = () => (
    <div className="flex flex-col items-center text-center max-w-sm w-full">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gold-300 to-gold-400 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl"
        >
          👋
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        What should we call you?
      </h2>
      <p className="text-sm text-brown-light leading-relaxed mb-6">
        Just your first name is perfect.
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        autoFocus
        className="w-full max-w-xs px-4 py-3 rounded-xl border border-cream-200 bg-white text-brown text-center text-lg placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 transition-colors"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && name.trim()) handleNext();
        }}
      />
    </div>
  );

  const renderApiKeyStep = () => (
    <div className="flex flex-col items-center text-center max-w-sm w-full">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sage-500 to-sage-300 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-2">
        Let&apos;s set up your AI helper
      </h2>
      <p className="text-sm text-brown-light leading-relaxed mb-5">
        Wreath Social uses Google&apos;s free AI to write captions for your photos. You&apos;ll need a
        free API key&nbsp;&mdash; it takes about 30 seconds!
      </p>

      {/* Instructions */}
      <ol className="text-left text-sm text-brown-light space-y-2 mb-5 w-full max-w-xs">
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold">1</span>
          <span>Tap the button below to open Google AI Studio</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold">2</span>
          <span>Sign in with your Google account</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold">3</span>
          <span>Click &ldquo;Create API Key&rdquo; (it&apos;s completely free)</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold">4</span>
          <span>Copy the key and paste it below</span>
        </li>
      </ol>

      {/* Open AI Studio button */}
      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream-200 text-brown border border-cream-200 hover:bg-gold-100 active:bg-gold-200 font-medium text-sm transition-colors mb-5"
      >
        Open Google AI Studio
        <IoOpenOutline className="w-4 h-4" />
      </a>

      {/* API key input */}
      <div className="w-full max-w-xs mb-3">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={showKey ? apiKey : apiKey ? '•'.repeat(Math.min(apiKey.length, 30)) : ''}
          onChange={(e) => {
            // If showing, accept input directly. If masked, only accept if it looks like a paste (not dots).
            if (showKey || !apiKey || !e.target.value.includes('•')) {
              setApiKey(e.target.value);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').trim();
            setApiKey(pasted);
            setShowKey(false);
          }}
          placeholder="Paste your API key here"
          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-brown text-sm placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && apiKey.trim()) handleNext();
          }}
        />
        <div className="flex justify-end mt-1.5">
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-brown-light/50 hover:text-brown-light transition-colors"
          >
            {showKey ? <IoEyeOffOutline className="w-3.5 h-3.5" /> : <IoEyeOutline className="w-3.5 h-3.5" />}
            {showKey ? 'Hide' : 'Show'} key
          </button>
        </div>
      </div>

      <p className="text-xs text-brown-light/50 mb-4">
        🔒 Your key stays on this device only. We never see it.
      </p>

      {/* Skip for now */}
      <button
        onClick={handleSkipApiKey}
        className="text-sm text-brown-light/60 hover:text-brown-light transition-colors underline underline-offset-2"
      >
        Skip for now &mdash; I&apos;ll set it up later in Settings
      </button>
    </div>
  );

  const renderUploadStep = () => (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gold-300 to-gold-400 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <IoCameraOutline className="w-10 h-10 text-white" />
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        Upload a Photo
      </h2>
      <p className="text-sm text-brown-light leading-relaxed">
        Just snap a pic of your wreath&nbsp;&mdash; that&apos;s all you need to do. The AI will write a
        caption, pick the hashtags, and get it ready for you to review.
      </p>
    </div>
  );

  const renderControlStep = () => (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <IoCheckmarkCircleOutline className="w-10 h-10 text-white" />
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        You Stay in Control
      </h2>
      <p className="text-sm text-brown-light leading-relaxed">
        Nothing posts without your approval. Edit anything, any time. This is your business&nbsp;&mdash;
        you always have the final say.
      </p>
    </div>
  );

  const stepRenderers = [
    renderWelcome,
    renderNameStep,
    renderApiKeyStep,
    renderUploadStep,
    renderControlStep,
  ];

  // Button label per step
  const getButtonLabel = () => {
    if (isLast) return 'Get Started';
    if (currentStep === 2 && apiKey.trim()) return 'Save & Continue';
    return 'Next';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-cream-50 flex flex-col"
    >
      {/* Skip button */}
      {!isLast && (
        <div className="absolute top-4 right-4 z-10 pt-[env(safe-area-inset-top)]">
          <button
            onClick={handleSkip}
            className="text-sm text-brown-light/60 hover:text-brown-light transition-colors px-3 py-1"
          >
            Skip
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center w-full"
          >
            {stepRenderers[currentStep]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-8 pt-4 pb-[env(safe-area-inset-bottom)]">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentStep ? 24 : 8,
                backgroundColor: i === currentStep ? '#7C9A6E' : '#dce8d8',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Hide the main Next button on the API key step when the user hasn't entered a key
            (they can still proceed via "Skip for now") */}
        {currentStep === 2 && !apiKey.trim() ? (
          <div className="h-[52px]" /> // spacer so layout doesn't jump
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {getButtonLabel()}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function useOnboarding() {
  const shouldShow = () => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(ONBOARDING_KEY);
  };
  return { shouldShow };
}
