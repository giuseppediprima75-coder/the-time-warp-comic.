import { Chapter, defaultChapters } from '../data/chapters';
import { Character } from './geminiService';

const DB_NAME = 'the_time_warp_db';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';
const STORE_SETTINGS = 'settings';

export interface AppSettings {
  socialInstagram?: string;
  socialTiktok?: string;
  socialFacebook?: string;
  canvaPdfLink?: string;
  authorModePassword?: string;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
    };
  });
}

export async function getChapters(): Promise<Chapter[]> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_CHAPTERS, 'readonly');
        const store = transaction.objectStore(STORE_CHAPTERS);
        const request = store.getAll();

        request.onsuccess = () => {
          const result = request.result as Chapter[];
          if (result && result.length > 0) {
            let hasUpdated = false;
            const merged = result.map(dbCh => {
              const defCh = defaultChapters.find(c => c.id === dbCh.id);
              if (defCh) {
                // If default is published but local DB index lists as coming soon, or local DB is missing pages
                if ((defCh.status === 'published' && dbCh.status !== 'published') || 
                    (defCh.pages && defCh.pages.length > 0 && (!dbCh.pages || dbCh.pages.length === 0)) ||
                    (defCh.subtitle !== dbCh.subtitle)) {
                  hasUpdated = true;
                  return { ...dbCh, ...defCh };
                }
              }
              return dbCh;
            });

            // Check for any entirely new chapters in defaultChapters
            if (defaultChapters.length > merged.length) {
              defaultChapters.forEach(defCh => {
                if (!merged.some(m => m.id === defCh.id)) {
                  merged.push(defCh);
                  hasUpdated = true;
                }
              });
            }

            if (hasUpdated) {
              saveChapters(merged).then(() => {
                resolve(merged);
              }).catch(() => {
                resolve(merged);
              });
            } else {
              resolve(merged);
            }
          } else {
            // Store defaults
            saveChapters(defaultChapters).then(() => {
              resolve(defaultChapters);
            }).catch(() => {
              resolve(defaultChapters);
            });
          }
        };

        request.onerror = () => {
          resolve(defaultChapters);
        };
      } catch (transErr) {
        console.warn('Could not launch IndexedDB chapters transaction, falling back:', transErr);
        resolve(defaultChapters);
      }
    });
  } catch (err) {
    console.warn('IndexedDB error, falling back to default chapters:', err);
    return defaultChapters;
  }
}

export async function saveChapters(chapters: Chapter[]): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_CHAPTERS, 'readwrite');
        const store = transaction.objectStore(STORE_CHAPTERS);

        // Clear old entries
        store.clear();

        chapters.forEach((chapter) => {
          store.put(chapter);
        });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      } catch (transErr) {
        console.warn('Could not launch IndexedDB chapters save transaction:', transErr);
        resolve(); // resolve instead of reject to avoid crashing
      }
    });
  } catch (err) {
    console.error('IndexedDB save error:', err);
  }
}

export async function getSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    socialInstagram: 'https://instagram.com/thetimewarp_isaltimancanti',
    socialTiktok: 'https://tiktok.com',
    socialFacebook: 'https://facebook.com',
    canvaPdfLink: '',
    authorModePassword: 'warp' // Default simple access code
  };

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_SETTINGS, 'readonly');
        const store = transaction.objectStore(STORE_SETTINGS);
        const request = store.get('app_config');

        request.onsuccess = () => {
          resolve(request.result ? { ...defaultSettings, ...request.result } : defaultSettings);
        };

        request.onerror = () => {
          resolve(defaultSettings);
        };
      } catch (transErr) {
        console.warn('Could not launch IndexedDB settings transaction, falling back:', transErr);
        resolve(defaultSettings);
      }
    });
  } catch (err) {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_SETTINGS, 'readwrite');
        const store = transaction.objectStore(STORE_SETTINGS);
        store.put(settings, 'app_config');

        transaction.oncomplete = () => {
          resolve();
        };
        
        transaction.onerror = () => {
          reject(transaction.error);
        };
      } catch (transErr) {
        console.warn('Could not launch IndexedDB settings save transaction:', transErr);
        resolve(); // resolve to avoid unhandled crashes
      }
    });
  } catch (err) {
    console.error('IndexedDB settings save error:', err);
  }
}
