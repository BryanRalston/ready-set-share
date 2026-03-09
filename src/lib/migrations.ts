const KEY_MIGRATIONS: [string, string][] = [
  ['wreath-social-user-prefs', 'biz-social-user-prefs'],
  ['wreath-social-drafts', 'biz-social-drafts'],
  ['wreath-social-gemini-key', 'biz-social-gemini-key'],
  ['wreath-social-streak-data', 'biz-social-streak-data'],
  ['wreath-social-dark-mode', 'biz-social-dark-mode'],
  ['wreath-social-connected-accounts', 'biz-social-connected-accounts'],
  ['wreath-social-onboarding-seen', 'biz-social-onboarding-seen'],
  ['wreath-social-brand-colors', 'biz-social-brand-colors'],
  ['wreath-social-brand-vibe', 'biz-social-brand-vibe'],
  ['wreath-social-photo-count', 'biz-social-photo-count'],
  ['wreath_post_history', 'biz-social-post-history'],
  ['wreath_post_timestamps', 'biz-social-post-timestamps'],
  ['wreath_caption_edits', 'biz-social-caption-edits'],
  ['wreath-social-pending-post', 'biz-social-pending-post'],
  ['wreath-social-nudge-dismissed', 'biz-social-nudge-dismissed'],
  ['wreath-social-nudge-snoozed', 'biz-social-nudge-snoozed'],
  ['wreath-social-install-dismissed', 'biz-social-install-dismissed'],
];

export function runMigrations(): void {
  if (typeof window === 'undefined') return;
  for (const [oldKey, newKey] of KEY_MIGRATIONS) {
    const old = localStorage.getItem(oldKey);
    if (old && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, old);
      localStorage.removeItem(oldKey);
    }
  }
}
