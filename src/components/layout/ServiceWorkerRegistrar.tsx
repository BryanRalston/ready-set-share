'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw-register';

/**
 * Registers the service worker on mount.
 * This is a render-less component — it returns null.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
