export interface LibraryPhoto {
  id: string;
  name: string;
  description: string;
  base64: string;
  thumbnail: string;
  tags: string[];
  createdAt: string;
}

const DB_NAME = 'postcraft-photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let dbWarningShown = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      if (!dbWarningShown) {
        dbWarningShown = true;
        console.warn(
          'PostCraft: IndexedDB is unavailable (possibly private browsing mode). Photo library features will not work.'
        );
      }
      reject(request.error);
    };
  });
}

function generateId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function addPhoto(
  photo: Omit<LibraryPhoto, 'id' | 'createdAt'>
): Promise<LibraryPhoto> {
  const db = await openDB();
  const fullPhoto: LibraryPhoto = {
    ...photo,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(fullPhoto);

    request.onsuccess = () => resolve(fullPhoto);
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotos(): Promise<LibraryPhoto[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const photos = request.result as LibraryPhoto[];
      // Sort by createdAt descending (newest first)
      photos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotoById(
  id: string
): Promise<LibraryPhoto | undefined> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as LibraryPhoto | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updatePhoto(
  id: string,
  updates: Partial<Pick<LibraryPhoto, 'name' | 'description' | 'tags'>>
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as LibraryPhoto | undefined;
      if (!existing) {
        reject(new Error(`Photo with id "${id}" not found`));
        return;
      }

      const updated: LibraryPhoto = { ...existing, ...updates };
      const putRequest = store.put(updated);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function createThumbnail(
  base64: string,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down to fit within maxSize
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = base64;
  });
}
