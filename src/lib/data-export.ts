// Export/Import utility for full app data backup and restore

import { getPhotos, addPhoto, type LibraryPhoto } from './photo-library';

export interface ExportData {
  version: string; // '1.0'
  exportedAt: string; // ISO date
  appName: string; // 'PostCraft'
  localStorage: Record<string, string>; // All biz-social-* keys
  photos: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    createdAt: string;
    base64: string;
    thumbnail: string;
  }>;
}

/**
 * Collect all app data into an ExportData object.
 * Gathers all localStorage keys starting with 'biz-social-' and all photos from IndexedDB.
 */
export async function exportAllData(): Promise<ExportData> {
  // Gather localStorage keys
  const localStorageData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('biz-social-')) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        localStorageData[key] = value;
      }
    }
  }

  // Gather photos from IndexedDB
  let photos: LibraryPhoto[] = [];
  try {
    photos = await getPhotos();
  } catch {
    // IndexedDB unavailable (e.g., private browsing)
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'PostCraft',
    localStorage: localStorageData,
    photos: photos.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      tags: p.tags,
      createdAt: p.createdAt,
      base64: p.base64,
      thumbnail: p.thumbnail,
    })),
  };
}

/**
 * Validate that a parsed JSON object is valid ExportData.
 */
export function validateExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'string') return false;
  if (typeof d.localStorage !== 'object' || d.localStorage === null || Array.isArray(d.localStorage)) return false;
  if (!Array.isArray(d.photos)) return false;

  return true;
}

/**
 * Import data from an ExportData object, merging with existing data.
 * Does not overwrite existing data — merges localStorage keys and skips duplicate photos.
 */
export async function importData(
  data: ExportData
): Promise<{
  success: boolean;
  imported: { settings: boolean; drafts: number; photos: number; accounts: number };
}> {
  const result = {
    settings: false,
    drafts: 0,
    photos: 0,
    accounts: 0,
  };

  // Import localStorage keys (merge — don't overwrite existing unless it's part of the import)
  if (data.localStorage && typeof data.localStorage === 'object') {
    for (const [key, value] of Object.entries(data.localStorage)) {
      if (key.startsWith('biz-social-')) {
        // Track what kind of data we're importing
        if (key === 'biz-social-user-prefs') {
          result.settings = true;
        } else if (key === 'biz-social-drafts') {
          // Merge drafts: combine arrays, skip duplicates by id
          try {
            const existingRaw = localStorage.getItem(key);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const incoming = JSON.parse(value);
            if (Array.isArray(existing) && Array.isArray(incoming)) {
              const existingIds = new Set(existing.map((d: { id?: string }) => d.id).filter(Boolean));
              const newDrafts = incoming.filter(
                (d: { id?: string }) => d.id && !existingIds.has(d.id)
              );
              result.drafts = newDrafts.length;
              if (newDrafts.length > 0) {
                localStorage.setItem(key, JSON.stringify([...existing, ...newDrafts]));
              }
              continue; // Skip the default setItem below
            }
          } catch {
            // Fall through to default set
          }
        } else if (key === 'biz-social-connected-accounts') {
          // Merge accounts: combine arrays, skip duplicates by platform
          try {
            const existingRaw = localStorage.getItem(key);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const incoming = JSON.parse(value);
            if (Array.isArray(existing) && Array.isArray(incoming)) {
              const existingPlatforms = new Set(
                existing.map((a: { platform?: string }) => a.platform).filter(Boolean)
              );
              const newAccounts = incoming.filter(
                (a: { platform?: string }) => a.platform && !existingPlatforms.has(a.platform)
              );
              result.accounts = newAccounts.length;
              if (newAccounts.length > 0) {
                localStorage.setItem(key, JSON.stringify([...existing, ...newAccounts]));
              }
              continue;
            }
          } catch {
            // Fall through to default set
          }
        }

        // Default: set the key (overwrites for settings-like keys, which is expected)
        localStorage.setItem(key, value);
      }
    }
  }

  // Import photos (merge — skip photos with the same id)
  if (Array.isArray(data.photos) && data.photos.length > 0) {
    let existingPhotos: LibraryPhoto[] = [];
    try {
      existingPhotos = await getPhotos();
    } catch {
      // IndexedDB unavailable
    }

    const existingIds = new Set(existingPhotos.map((p) => p.id));

    for (const photo of data.photos) {
      if (photo.id && !existingIds.has(photo.id)) {
        try {
          await addPhoto({
            name: photo.name || '',
            description: photo.description || '',
            tags: photo.tags || [],
            base64: photo.base64,
            thumbnail: photo.thumbnail,
          });
          result.photos++;
        } catch {
          // Skip failed photos
        }
      }
    }
  }

  return { success: true, imported: result };
}

/**
 * Trigger a file download of the full app data export.
 * Filename format: postcraft-backup-YYYY-MM-DD.json
 */
export async function downloadExport(): Promise<void> {
  const data = await exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const filename = `postcraft-backup-${yyyy}-${mm}-${dd}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a .json file and import its data into the app.
 * Validates the file structure before importing.
 */
export async function importFromFile(
  file: File
): Promise<{
  success: boolean;
  imported: { settings: boolean; drafts: number; photos: number; accounts: number };
  error?: string;
}> {
  try {
    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        success: false,
        imported: { settings: false, drafts: 0, photos: 0, accounts: 0 },
        error: 'Invalid JSON file. Please select a valid PostCraft backup.',
      };
    }

    if (!validateExportData(parsed)) {
      return {
        success: false,
        imported: { settings: false, drafts: 0, photos: 0, accounts: 0 },
        error: 'This file is not a valid PostCraft backup. Missing required fields.',
      };
    }

    const result = await importData(parsed);
    return result;
  } catch {
    return {
      success: false,
      imported: { settings: false, drafts: 0, photos: 0, accounts: 0 },
      error: 'Failed to read the file. Please try again.',
    };
  }
}
