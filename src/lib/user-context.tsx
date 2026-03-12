'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from './gemini';
import { runMigrations } from './migrations';

const PREFS_KEY = 'biz-social-user-prefs';

interface UserPreferences {
  displayName: string;
  setupComplete: boolean;
  createdAt: string;
  businessType?: string;
  businessName?: string;
  businessDescription?: string;
}

interface UserContextValue {
  displayName: string;
  isSetup: boolean;
  geminiApiKey: string | null;
  createdAt: string;
  businessType: string;
  businessName: string;
  businessDescription: string;
  updatePreferences: (prefs: Partial<UserPreferences & { geminiApiKey: string }>) => void;
  clearPreferences: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

function loadPrefs(): UserPreferences {
  if (typeof window === 'undefined') {
    return { displayName: '', setupComplete: false, createdAt: new Date().toISOString() };
  }
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { displayName: '', setupComplete: false, createdAt: new Date().toISOString() };
}

function savePrefs(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPrefs);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('rss-migrations-done')) {
      runMigrations();
      sessionStorage.setItem('rss-migrations-done', '1');
    }
    setPrefs(loadPrefs());
    setApiKey(getGeminiApiKey());
    setMounted(true);
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences & { geminiApiKey: string }>) => {
    if (updates.geminiApiKey !== undefined) {
      setGeminiApiKey(updates.geminiApiKey);
      setApiKey(updates.geminiApiKey);
    }

    setPrefs(prev => {
      const { geminiApiKey, ...prefUpdates } = updates;
      const next = { ...prev, ...prefUpdates };
      savePrefs(next);
      return next;
    });
  }, []);

  const clearPreferences = useCallback(() => {
    localStorage.removeItem(PREFS_KEY);
    removeGeminiApiKey();
    const fresh: UserPreferences = { displayName: '', setupComplete: false, createdAt: new Date().toISOString() };
    setPrefs(fresh);
    setApiKey(null);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <UserContext.Provider value={{
        displayName: '',
        isSetup: false,
        geminiApiKey: null,
        createdAt: new Date().toISOString(),
        businessType: '',
        businessName: '',
        businessDescription: '',
        updatePreferences,
        clearPreferences,
      }}>
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{
      displayName: prefs.displayName,
      isSetup: prefs.setupComplete,
      geminiApiKey: apiKey,
      createdAt: prefs.createdAt,
      businessType: prefs.businessType || '',
      businessName: prefs.businessName || '',
      businessDescription: prefs.businessDescription || '',
      updatePreferences,
      clearPreferences,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
