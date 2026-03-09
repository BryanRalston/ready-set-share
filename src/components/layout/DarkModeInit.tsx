'use client';

import { useEffect } from 'react';

/**
 * Client component that restores dark mode preference from localStorage on mount.
 * Must be placed early in the component tree.
 */
export default function DarkModeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('biz-social-dark-mode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}
