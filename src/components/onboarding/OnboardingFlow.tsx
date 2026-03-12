'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useUser } from '@/lib/user-context';
import { BUSINESS_TYPES, getBusinessTypeInfo } from '@/lib/business-profile';
import type { BusinessType } from '@/lib/business-profile';
import {
  IoSparklesOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoOpenOutline,
  IoCameraOutline,
} from 'react-icons/io5';

const ONBOARDING_KEY = 'biz-social-onboarding-seen';
const TOTAL_STEPS = 5;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { updatePreferences } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1 state — business type
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);

  // Step 2 state — business info
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  // Step 3 state — API key
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Derived info about selected business type
  const selectedTypeInfo = useMemo(
    () => (selectedType ? getBusinessTypeInfo(selectedType) : null),
    [selectedType]
  );

  // Generate a placeholder name based on selected type
  const namePlaceholder = useMemo(() => {
    if (!selectedTypeInfo) return 'My Business';
    const examples: Record<string, string> = {
      wreaths: "Bloom & Vine Wreaths",
      candles: "Golden Hour Candles",
      jewelry: "Tiny Luxe Jewelry",
      pottery: "Fireside Pottery",
      'baked-goods': "Sweet Mornings Bakery",
      soap: "Wild Sage Soap Co.",
      art: "Brushwork Studio",
      clothing: "Thread & Bloom",
      woodwork: "Grain & Grit Woodshop",
      flowers: "Petal & Stem",
      crafts: "The Craft Corner",
      restaurant: "The Corner Table",
      'food-truck': "Rolling Feast",
      cafe: "Morning Brew Cafe",
      salon: "Glow Hair Studio",
      barber: "Sharp Cuts Barbershop",
      cleaning: "Sparkle Clean Co.",
      landscaping: "Green Thumb Landscaping",
      'auto-detailing': "Elite Auto Detail",
      fitness: "FitLife Training",
      photography: "Captured Moments Photo",
      coaching: "Level Up Coaching",
      'real-estate': "HomeFind Realty",
      boutique: "The Little Boutique",
      'pet-services': "Happy Paws Pet Care",
      other: "My Business",
    };
    return examples[selectedTypeInfo.key] || "My Business";
  }, [selectedTypeInfo]);

  const finishOnboarding = useCallback(() => {
    const prefs: Record<string, string | boolean> = {
      setupComplete: true,
    };

    if (businessName.trim()) {
      prefs.displayName = businessName.trim();
      prefs.businessName = businessName.trim();
    }
    if (selectedType) {
      prefs.businessType = selectedType;
    }
    // Save description — use the example description as fallback if user never edited
    const descToSave = businessDescription.trim()
      || (!descriptionTouched && selectedTypeInfo?.exampleDescription) || '';
    if (descToSave) {
      prefs.businessDescription = descToSave;
    }
    if (apiKey.trim()) {
      prefs.geminiApiKey = apiKey.trim();
    }

    updatePreferences(prefs);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  }, [updatePreferences, onComplete, businessName, selectedType, businessDescription, descriptionTouched, selectedTypeInfo, apiKey]);

  const handleNext = useCallback(() => {
    if (currentStep === TOTAL_STEPS - 1) {
      finishOnboarding();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, [currentStep, finishOnboarding]);

  const handleSkip = useCallback(() => {
    finishOnboarding();
  }, [finishOnboarding]);

  const handleSkipApiKey = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, []);

  const isLast = currentStep === TOTAL_STEPS - 1;

  // Determine whether "Next" should be disabled on the current step
  const isNextDisabled = useMemo(() => {
    if (currentStep === 1) return !selectedType;
    if (currentStep === 2) return !businessName.trim();
    return false;
  }, [currentStep, selectedType, businessName]);

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
          transition={{ duration: 2, repeat: 3, repeatDelay: 1 }}
        >
          <IoSparklesOutline className="w-16 h-16 text-white" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        Welcome to Ready Set Share!
      </h2>
      <p className="text-sm text-brown-light leading-relaxed">
        Your AI-powered social media assistant for small business.
      </p>
    </div>
  );

  const renderBusinessTypeStep = () => (
    <div className="flex flex-col items-center text-center max-w-md w-full">
      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-2">
        What do you sell?
      </h2>
      <p className="text-sm text-brown-light leading-relaxed mb-6">
        Pick the category that best describes your business.
      </p>

      <div className="grid grid-cols-3 gap-2.5 w-full mb-2">
        {BUSINESS_TYPES.map((bt) => {
          const isSelected = selectedType === bt.key;
          return (
            <motion.button
              key={bt.key}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(bt.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-cream-200 bg-white hover:border-sage-200 hover:bg-cream-50'
              }`}
            >
              <span className="text-2xl">{bt.emoji}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-sage-700' : 'text-brown-light'}`}>
                {bt.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderBusinessInfoStep = () => {
    // Pre-fill description with example when first visiting step (if type selected)
    const effectiveDescription =
      !descriptionTouched && selectedTypeInfo && !businessDescription
        ? selectedTypeInfo.exampleDescription
        : businessDescription;

    return (
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-300 to-gold-400 flex items-center justify-center mb-6 shadow-lg">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: 3 }}
            className="text-5xl"
          >
            {selectedTypeInfo?.emoji || '🛍️'}
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-2">
          Tell us about your business
        </h2>
        <p className="text-sm text-brown-light leading-relaxed mb-6">
          This helps us personalize your captions and hashtags.
        </p>

        <div className="w-full space-y-4">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-brown text-left mb-1.5">
              Business name <span className="text-sage-500">*</span>
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={namePlaceholder}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-brown text-sm placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && businessName.trim()) handleNext();
              }}
            />
          </div>

          <div>
            <label htmlFor="business-desc" className="block text-sm font-medium text-brown text-left mb-1.5">
              Short description <span className="text-brown-light/50 font-normal">(optional)</span>
            </label>
            <textarea
              id="business-desc"
              value={effectiveDescription}
              onChange={(e) => {
                setBusinessDescription(e.target.value);
                setDescriptionTouched(true);
              }}
              onFocus={() => {
                if (!descriptionTouched && selectedTypeInfo && !businessDescription) {
                  setBusinessDescription(selectedTypeInfo.exampleDescription);
                  setDescriptionTouched(true);
                }
              }}
              placeholder="What makes your products special?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-brown text-sm placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

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
        Get personalized captions for your products. You&apos;ll need a
        free Google AI API key&nbsp;&mdash; it takes about 30 seconds!
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
          aria-label="Google AI API key"
          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-brown text-sm placeholder:text-brown-light/75 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 transition-colors"
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
        Your key stays on this device only. We never see it.
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

  const renderReadyStep = () => (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center mb-8 shadow-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <IoCameraOutline className="w-10 h-10 text-white" />
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-brown font-[family-name:var(--font-heading)] mb-3">
        You&apos;re all set!
      </h2>

      {/* Summary */}
      {(selectedTypeInfo || businessName.trim()) && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-sage-50 border border-sage-100">
          {selectedTypeInfo && <span className="text-xl">{selectedTypeInfo.emoji}</span>}
          <span className="text-sm font-medium text-brown">
            {businessName.trim() || selectedTypeInfo?.label || 'Your business'}
          </span>
        </div>
      )}

      <p className="text-sm text-brown-light leading-relaxed">
        Upload your first product photo and let the AI craft the perfect caption for your social media.
      </p>
    </div>
  );

  const stepRenderers = [
    renderWelcome,
    renderBusinessTypeStep,
    renderBusinessInfoStep,
    renderApiKeyStep,
    renderReadyStep,
  ];

  // Button label per step
  const getButtonLabel = () => {
    if (currentStep === 0) return 'Get Started';
    if (isLast) return 'Get Started';
    if (currentStep === 3 && apiKey.trim()) return 'Save & Continue';
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
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
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
              transition={{ duration: 0.15 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Hide the main Next button on the API key step when the user hasn't entered a key
            (they can still proceed via "Skip for now") */}
        {currentStep === 3 && !apiKey.trim() ? (
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
