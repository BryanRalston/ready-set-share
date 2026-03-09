// Service Worker registration and notification scheduling

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker. Call once on app load.
 * Returns the registration if successful, null otherwise.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    swRegistration = registration;

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Get the current service worker registration (if registered).
 */
export function getRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

/**
 * Send a notification via the service worker.
 * Falls back to basic Notification API if SW is unavailable.
 */
export async function showSWNotification(
  title: string,
  body: string,
  tag?: string
): Promise<void> {
  // Try service worker first
  const registration = swRegistration || (await navigator.serviceWorker?.ready.catch(() => null));

  if (registration?.active) {
    registration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
      tag: tag || 'postcraft-notification',
      icon: '/icons/icon-192.png',
    });
    return;
  }

  // Fallback to basic Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag: tag || 'postcraft-notification',
    });
  }
}

/**
 * Schedule a notification to be shown after a delay.
 * Note: This uses setTimeout, so it only works while the page is open.
 * The service worker handles displaying the notification, which works
 * even when the tab isn't focused.
 */
export function scheduleNotification(
  title: string,
  body: string,
  tag: string,
  delayMs: number
): number {
  const timerId = window.setTimeout(() => {
    showSWNotification(title, body, tag);
  }, delayMs);

  return timerId;
}
