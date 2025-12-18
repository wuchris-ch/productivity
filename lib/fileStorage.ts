import { Habit, Area, HabitEntry } from './types';

// Data structure for the JSON file
export interface HabitData {
  version: number;
  exportedAt: string;
  habits: Habit[];
  areas: Area[];
  entries: HabitEntry[];
}

const DB_NAME = 'habit-tracker-fs';
const STORE_NAME = 'file-handles';
const HANDLE_KEY = 'main-file-handle';

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

// IndexedDB helpers for persisting the file handle
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, HANDLE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getStoredFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch {
    return null;
  }
}

export async function clearStoredFileHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(HANDLE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Request permission to access the file
export async function verifyPermission(
  handle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
  const options = { mode };

  // Check current permission state
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }

  // Request permission if needed
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
}

// Show file picker to select/create a save file
export async function pickSaveFile(): Promise<FileSystemFileHandle | null> {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'habits.json',
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    await saveFileHandle(handle);
    return handle;
  } catch (err) {
    // User cancelled the picker
    if ((err as Error).name === 'AbortError') {
      return null;
    }
    throw err;
  }
}

// Show file picker to open an existing file
export async function pickOpenFile(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
      multiple: false,
    });
    await saveFileHandle(handle);
    return handle;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return null;
    }
    throw err;
  }
}

// Write data to the file
export async function writeToFile(
  handle: FileSystemFileHandle,
  data: HabitData
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

// Read data from the file
export async function readFromFile(
  handle: FileSystemFileHandle
): Promise<HabitData | null> {
  try {
    const file = await handle.getFile();
    const contents = await file.text();
    if (!contents.trim()) {
      return null;
    }
    return JSON.parse(contents) as HabitData;
  } catch {
    return null;
  }
}

// Create export data structure
export function createExportData(
  habits: Habit[],
  areas: Area[],
  entries: HabitEntry[]
): HabitData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    areas,
    entries,
  };
}

// Validate imported data
export function validateImportData(data: unknown): data is HabitData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === 'number' &&
    Array.isArray(d.habits) &&
    Array.isArray(d.areas) &&
    Array.isArray(d.entries)
  );
}
