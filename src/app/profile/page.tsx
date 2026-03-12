'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/lib/user-context';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BrandKit from '@/components/profile/BrandKit';
import ConnectedAccounts from '@/components/profile/ConnectedAccounts';
import {
  IoImageOutline,
  IoFlameOutline,
  IoCalendarOutline,
  IoTrashOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoPersonOutline,
  IoKeyOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoStorefrontOutline,
  IoCreateOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';
import { formatDate } from '@/lib/utils';
import { getPostCount } from '@/lib/posting-analytics';
import { getCurrentStreak } from '@/lib/streak';
import { getDrafts } from '@/lib/publisher';
import VoiceProfileCard from '@/components/profile/VoiceProfile';
import LandingPagePreview from '@/components/profile/LandingPagePreview';
import GitHubDeploy from '@/components/profile/GitHubDeploy';
import DataManagement from '@/components/profile/DataManagement';
import QRGenerator from '@/components/profile/QRGenerator';
import ShareCard from '@/components/social/ShareCard';
import { BUSINESS_TYPES, getBusinessTypeInfo, type BusinessType } from '@/lib/business-profile';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

const DARK_MODE_KEY = 'biz-social-dark-mode';

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { displayName, geminiApiKey, updatePreferences, clearPreferences, createdAt, businessType, businessName, businessDescription } = useUser();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRemoveApiKeyModal, setShowRemoveApiKeyModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  // Business info editing state
  const [editingBusinessName, setEditingBusinessName] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState(businessName);
  const [editingBusinessDesc, setEditingBusinessDesc] = useState(false);
  const [businessDescInput, setBusinessDescInput] = useState(businessDescription);
  const [editingBusinessType, setEditingBusinessType] = useState(false);

  // Load real stats and dark mode preference on mount
  useEffect(() => {
    setPostCount(getPostCount());
    setStreak(getCurrentStreak());
    setDraftCount(getDrafts().length);
    const stored = localStorage.getItem(DARK_MODE_KEY);
    setDarkMode(stored === 'true');
  }, []);

  // Sync nameInput when displayName changes
  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  // Sync apiKeyInput when geminiApiKey changes
  useEffect(() => {
    setApiKeyInput(geminiApiKey || '');
  }, [geminiApiKey]);

  // Sync business fields
  useEffect(() => {
    setBusinessNameInput(businessName);
  }, [businessName]);

  useEffect(() => {
    setBusinessDescInput(businessDescription);
  }, [businessDescription]);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(DARK_MODE_KEY, next.toString());
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updatePreferences({ displayName: nameInput.trim() });
      toast('Settings saved', 'success');
    }
    setEditingName(false);
  };

  const handleSaveBusinessName = () => {
    if (businessNameInput.trim()) {
      updatePreferences({ businessName: businessNameInput.trim(), displayName: businessNameInput.trim() });
      toast('Settings saved', 'success');
    }
    setEditingBusinessName(false);
  };

  const handleSaveBusinessDesc = () => {
    updatePreferences({ businessDescription: businessDescInput.trim() });
    setEditingBusinessDesc(false);
    toast('Settings saved', 'success');
  };

  const handleSelectBusinessType = (type: string) => {
    updatePreferences({ businessType: type });
    setEditingBusinessType(false);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim() && geminiApiKey) {
      setShowRemoveApiKeyModal(true);
      return;
    }
    updatePreferences({ geminiApiKey: apiKeyInput.trim() });
    setEditingApiKey(false);
    toast('Settings saved', 'success');
  };

  const handleConfirmRemoveApiKey = () => {
    updatePreferences({ geminiApiKey: '' });
    setEditingApiKey(false);
    setShowRemoveApiKeyModal(false);
    toast('API key removed', 'info');
  };

  const handleResetApp = () => {
    clearPreferences();
    localStorage.removeItem(DARK_MODE_KEY);
    document.documentElement.classList.remove('dark');
    setDarkMode(false);
    setShowResetModal(false);
  };

  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = createdAt ? formatDate(createdAt) : 'Recently';

  return (
    <AppShell title="Profile" showNotifications={false}>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Avatar + name */}
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center pt-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-sage-500/20 dark:shadow-sage-400/40 mb-3">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
            {displayName}
          </h2>
        </motion.div>

        {/* Business Info */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <IoStorefrontOutline className="w-4 h-4 text-sage-500" />
              <h3 className="font-semibold text-brown text-sm">Business Info</h3>
            </div>
            <div className="space-y-3">
              {/* Business Type */}
              <div>
                <span className="text-xs text-brown-light mb-1 block">Business Type</span>
                {editingBusinessType ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {BUSINESS_TYPES.map((bt) => (
                      <button
                        key={bt.key}
                        onClick={() => handleSelectBusinessType(bt.key)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 ${
                          businessType === bt.key
                            ? 'bg-sage-50 border-sage-300 text-brown font-medium'
                            : 'bg-cream-50 border-cream-200 text-brown-light hover:bg-cream-100'
                        }`}
                      >
                        {bt.emoji} {bt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingBusinessType(true)}
                    className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-cream-50 text-brown hover:bg-cream-100 transition-colors"
                  >
                    <span>
                      {businessType
                        ? `${getBusinessTypeInfo(businessType as BusinessType).emoji} ${getBusinessTypeInfo(businessType as BusinessType).label}`
                        : 'Select a business type'}
                    </span>
                    <IoCreateOutline className="w-3.5 h-3.5 text-brown-light" />
                  </button>
                )}
              </div>

              {/* Business Name */}
              <div>
                <span className="text-xs text-brown-light mb-1 block">Business Name</span>
                {editingBusinessName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={businessNameInput}
                      onChange={(e) => setBusinessNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBusinessName()}
                      placeholder="Your business name"
                      aria-label="Business name"
                      className="flex-1 text-sm px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveBusinessName}
                      className="text-xs font-medium text-white bg-sage-500 hover:bg-sage-600 px-3 py-2 rounded-xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingBusinessName(true)}
                    className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-cream-50 text-brown hover:bg-cream-100 transition-colors"
                  >
                    <span>{businessName || 'Tap to set business name'}</span>
                    <IoCreateOutline className="w-3.5 h-3.5 text-brown-light" />
                  </button>
                )}
              </div>

              {/* Business Description */}
              <div>
                <span className="text-xs text-brown-light mb-1 block">Description</span>
                {editingBusinessDesc ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={businessDescInput}
                      onChange={(e) => setBusinessDescInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBusinessDesc()}
                      placeholder="What does your business do?"
                      aria-label="Business description"
                      className="flex-1 text-sm px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveBusinessDesc}
                      className="text-xs font-medium text-white bg-sage-500 hover:bg-sage-600 px-3 py-2 rounded-xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingBusinessDesc(true)}
                    className="w-full flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-cream-50 text-brown hover:bg-cream-100 transition-colors"
                  >
                    <span className={businessDescription ? '' : 'text-brown-light'}>
                      {businessDescription || 'Tap to add a description'}
                    </span>
                    <IoCreateOutline className="w-3.5 h-3.5 text-brown-light" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-3 gap-3">
            <Card padding="sm" className="text-center" animate={false}>
              <IoImageOutline className="w-5 h-5 text-sage-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{postCount}</p>
              <p className="text-[10px] text-brown-light">Total Posts</p>
            </Card>
            <Card padding="sm" className="text-center" animate={false}>
              <IoFlameOutline className="w-5 h-5 text-gold-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{streak}</p>
              <p className="text-[10px] text-brown-light">Day Streak</p>
            </Card>
            <Card padding="sm" className="text-center" animate={false}>
              <IoCalendarOutline className="w-5 h-5 text-sage-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-brown">{draftCount}</p>
              <p className="text-[10px] text-brown-light">Drafts</p>
            </Card>
          </div>
          <Link href="/analytics" className="block mt-3">
            <Button variant="secondary" size="sm" className="w-full gap-1.5">
              <IoStatsChartOutline className="w-3.5 h-3.5" />
              View Analytics
            </Button>
          </Link>
        </motion.div>

        {/* Settings — Display Name & API Key */}
        <motion.div variants={fadeUp}>
          <Card>
            <h3 className="font-semibold text-brown text-sm mb-3">Settings</h3>
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <IoPersonOutline className="w-4 h-4 text-brown-light" />
                  <span className="text-sm text-brown font-medium">Display Name</span>
                </div>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      aria-label="Display name"
                      className="flex-1 text-sm px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="text-xs font-medium text-white bg-sage-500 hover:bg-sage-600 px-3 py-2 rounded-xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="w-full text-left text-sm px-3 py-2 rounded-xl bg-cream-50 text-brown hover:bg-cream-100 transition-colors"
                  >
                    {displayName}
                  </button>
                )}
              </div>

              {/* Gemini API Key */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <IoKeyOutline className="w-4 h-4 text-brown-light" />
                  <span className="text-sm text-brown font-medium">Gemini API Key</span>
                  {geminiApiKey && (
                    <IoCheckmarkCircle className="w-3.5 h-3.5 text-sage-500" />
                  )}
                </div>
                {editingApiKey ? (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                        placeholder="AIza..."
                        aria-label="Gemini API key"
                        className="w-full text-sm px-3 py-2 pr-9 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
                      >
                        {showApiKey ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveApiKey}
                      className="text-xs font-medium text-white bg-sage-500 hover:bg-sage-600 px-3 py-2 rounded-xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingApiKey(true)}
                    className="w-full text-left text-sm px-3 py-2 rounded-xl bg-cream-50 text-brown hover:bg-cream-100 transition-colors"
                  >
                    {geminiApiKey
                      ? `${geminiApiKey.slice(0, 6)}${'*'.repeat(20)}`
                      : 'Tap to add your API key'}
                  </button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Brand Kit */}
        <motion.div variants={fadeUp}>
          <BrandKit />
        </motion.div>

        {/* Voice Profile — below Brand Kit */}
        <motion.div variants={fadeUp}>
          <VoiceProfileCard />
        </motion.div>

        {/* Landing Page Preview */}
        <motion.div variants={fadeUp}>
          <LandingPagePreview />
        </motion.div>

        {/* GitHub Pages Deploy */}
        <motion.div variants={fadeUp}>
          <GitHubDeploy />
        </motion.div>

        {/* Data Management — Download Website, Export, Import */}
        <motion.div variants={fadeUp}>
          <DataManagement />
        </motion.div>

        {/* QR Code Generator */}
        <motion.div variants={fadeUp}>
          <QRGenerator />
        </motion.div>

        {/* Share Card */}
        <motion.div variants={fadeUp}>
          <ShareCard />
        </motion.div>

        {/* Connected Accounts */}
        <motion.div variants={fadeUp}>
          <ConnectedAccounts />
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {darkMode ? (
                  <IoMoonOutline className="w-5 h-5 text-brown-light" />
                ) : (
                  <IoSunnyOutline className="w-5 h-5 text-gold-300" />
                )}
                <span className="text-sm text-brown">Dark Mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
                role="switch"
                aria-checked={darkMode}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 ${
                  darkMode ? 'bg-sage-500' : 'bg-cream-200'
                }`}
              >
                <motion.div
                  animate={{ x: darkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Reset App Data */}
        <motion.div variants={fadeUp}>
          <Button
            variant="ghost"
            className="w-full gap-2 text-brown-light hover:text-red-500"
            onClick={() => setShowResetModal(true)}
          >
            <IoTrashOutline className="w-4 h-4" />
            Reset App Data
          </Button>
        </motion.div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset App Data"
      >
        <div className="text-center pb-2">
          <p className="text-sm text-brown mb-1">Are you sure?</p>
          <p className="text-xs text-brown-light mb-6">
            This will clear all your preferences, brand kit, and saved data. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1 gap-1.5"
              onClick={handleResetApp}
            >
              <IoTrashOutline className="w-4 h-4" />
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove API Key Confirmation Modal */}
      <Modal
        isOpen={showRemoveApiKeyModal}
        onClose={() => setShowRemoveApiKeyModal(false)}
        title="Remove API Key"
      >
        <div className="text-center pb-2">
          <p className="text-sm text-brown mb-1">Remove your API key?</p>
          <p className="text-xs text-brown-light mb-6">
            This will disable AI-generated captions. You&apos;ll get basic suggestions instead.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setShowRemoveApiKeyModal(false)}
            >
              Keep It
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleConfirmRemoveApiKey}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
