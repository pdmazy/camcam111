import { AppSettings, ScanDocument } from '../types';

const DB_NAME = 'PhotocopyScannerDB';
const STORE_DOCS = 'documents';
const DB_VERSION = 1;

const SETTINGS_KEY = 'photocopy_scanner_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  autoEdgeDetect: true,
  defaultFilter: 'photocopy_bw',
  pdfPageSize: 'a4',
  exportQuality: 0.9,
  compression: true,
  cloudSyncEnabled: false,
  securityLock: false,
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('مرورگر شما از پایگاه داده محلی پشتیبانی نمی‌کند'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const store = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredDocuments(): Promise<ScanDocument[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readonly');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.getAll();

      request.onsuccess = () => {
        const docs: ScanDocument[] = request.result || [];
        docs.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB read fallback:', err);
    const local = localStorage.getItem('backup_docs');
    return local ? JSON.parse(local) : [];
  }
}

export async function saveDocument(doc: ScanDocument): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB write fallback:', err);
    const existing = await getStoredDocuments();
    const idx = existing.findIndex((d) => d.id === doc.id);
    if (idx >= 0) existing[idx] = doc;
    else existing.unshift(doc);
    try {
      localStorage.setItem('backup_docs', JSON.stringify(existing.slice(0, 5)));
    } catch {}
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete fallback:', err);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.clear();

      request.onsuccess = () => {
        localStorage.removeItem('backup_docs');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    localStorage.removeItem('backup_docs');
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export async function exportBackupJson(): Promise<string> {
  const docs = await getStoredDocuments();
  const settings = getStoredSettings();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Smart Photocopy Scanner',
    settings,
    documents: docs,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importBackupJson(jsonString: string): Promise<number> {
  const parsed = JSON.parse(jsonString);
  if (!parsed.documents || !Array.isArray(parsed.documents)) {
    throw new Error('ساختار فایل پشتیبان معتبر نمی‌باشد');
  }

  let count = 0;
  for (const doc of parsed.documents) {
    if (doc.id && doc.pages) {
      await saveDocument(doc);
      count++;
    }
  }
  if (parsed.settings) {
    saveStoredSettings(parsed.settings);
  }
  return count;
}
