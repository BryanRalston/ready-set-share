'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/user-context';
import { isGeminiConfigured } from '@/lib/gemini';
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
} from 'react-icons/io5';
import { formatDate } from '@/lib/utils';
import VoiceProfileCard from '@/components/profile/VoiceProfile';
import LandingPagePreview from '@/components/profile/LandingPagePreview';
import QRGenerator from '@/components/profile/QRGenerator';
import ShareCard from '@/components/social/ShareCard';

const DARK_MODE_KEY = 'wreath-social-dark-mode';

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { displayName, geminiApiKey, updatePreferences, clearPreferences, createdAt } = useUser();
  const [darkMode, setDarkMode] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [editingApiKey, setEditingApiKey] = useState(false);

  // Sync nameInput when displayName changes
  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  // Sync apiKeyInput when geminiApiKey changes
  useEffect(() => {
    setApiKeyInput(geminiApiKey || '');
  }, [geminiApiKey]);

  // Load dark mode preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    const isDark = stored === 'true';
    setDarkMode(isDark);
  }, []);

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
    }
    setEditingName(false);
  };

  const handleSaveApiKey = () => {
    updatePreferences({ geminiApiKey: apiKeyInput.trim() });
    setEditingApiKey(false);
  };

  const handleResetApp = () => {
    if (window.confirm('This will clear all your preferences, brand kit, and saved data. Continue?')) {
      clearPreferences();
      localStorage.removeItem(DARK_MODE_KEY);
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
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
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-sage-500/20 mb-3">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-brown font-[family-name:var(--font-heading)]">
            {displayName}
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <Card padding="sm" className="text-center" animate={false}>
            <IoImageOutline className="w-5 h-5 text-sage-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-brown">0</p>
            <p className="text-[10px] text-brown-light">Total Posts</p>
          </Card>
          <Card padding="sm" className="text-center" animate={false}>
            <IoFlameOutline className="w-5 h-5 text-gold-300 mx-auto mb-1" />
            <p className="text-lg font-bold text-brown">0</p>
            <p className="text-[10px] text-brown-light">Day Streak</p>
          </Card>
          <Card padding="sm" className="text-center" animate={false}>
            <IoCalendarOutline className="w-5 h-5 text-sage-400 mx-auto mb-1" />
            <p className="text-[10px] text-brown-light mt-1">Member since</p>
            <p className="text-xs font-medium text-brown">{memberSince}</p>
          </Card>
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
                  {isGeminiConfigured() && (
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
                        className="w-full text-sm px-3 py-2 pr-9 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
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
                className={`relative w-11 h-6 rounded-full transition-colors ${
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
            onClick={handleResetApp}
          >
            <IoTrashOutline className="w-4 h-4" />
            Reset App Data
          </Button>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
