'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  isFileSystemAccessSupported,
  getStoredFileHandle,
  verifyPermission,
  pickSaveFile,
  pickOpenFile,
  writeToFile,
  readFromFile,
  createExportData,
  validateImportData,
  clearStoredFileHandle,
  HabitData,
} from '@/lib/fileStorage';
import { Habit, Area, HabitEntry } from '@/lib/types';

export type FileStorageStatus =
  | 'unsupported'     // Browser doesn't support File System Access API
  | 'disconnected'    // No file connected
  | 'connecting'      // Trying to reconnect to stored handle
  | 'permission'      // Needs permission re-grant
  | 'connected'       // File connected and writable
  | 'saving'          // Currently saving
  | 'error';          // Error occurred

interface FileStorageContextType {
  status: FileStorageStatus;
  fileName: string | null;
  lastSaved: Date | null;
  error: string | null;

  // Actions
  connectFile: () => Promise<boolean>;
  openExistingFile: () => Promise<HabitData | null>;
  disconnectFile: () => void;
  saveData: (habits: Habit[], areas: Area[], entries: HabitEntry[]) => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
}

const FileStorageContext = createContext<FileStorageContextType | null>(null);

export function FileStorageProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<FileStorageStatus>('connecting');
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  // Check for stored file handle on mount
  useEffect(() => {
    async function init() {
      if (!isFileSystemAccessSupported()) {
        setStatus('unsupported');
        return;
      }

      const storedHandle = await getStoredFileHandle();
      if (!storedHandle) {
        setStatus('disconnected');
        return;
      }

      fileHandleRef.current = storedHandle;
      setFileName(storedHandle.name);

      // Check if we still have permission
      const hasPermission = await verifyPermission(storedHandle);
      if (hasPermission) {
        setStatus('connected');
      } else {
        setStatus('permission');
      }
    }

    init();
  }, []);

  // Request permission for the stored file handle
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!fileHandleRef.current) return false;

    try {
      const granted = await verifyPermission(fileHandleRef.current);
      if (granted) {
        setStatus('connected');
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
      return false;
    }
  }, []);

  // Connect to a new file (create/pick save location)
  const connectFile = useCallback(async (): Promise<boolean> => {
    if (!isFileSystemAccessSupported()) {
      setError('File System Access API not supported');
      return false;
    }

    try {
      const handle = await pickSaveFile();
      if (!handle) {
        return false; // User cancelled
      }

      fileHandleRef.current = handle;
      setFileName(handle.name);
      setStatus('connected');
      setError(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
      return false;
    }
  }, []);

  // Open an existing file
  const openExistingFile = useCallback(async (): Promise<HabitData | null> => {
    if (!isFileSystemAccessSupported()) {
      setError('File System Access API not supported');
      return null;
    }

    try {
      const handle = await pickOpenFile();
      if (!handle) {
        return null; // User cancelled
      }

      const data = await readFromFile(handle);
      if (data && validateImportData(data)) {
        fileHandleRef.current = handle;
        setFileName(handle.name);
        setStatus('connected');
        setError(null);
        return data;
      } else {
        setError('Invalid file format');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
      return null;
    }
  }, []);

  // Disconnect from file
  const disconnectFile = useCallback(() => {
    fileHandleRef.current = null;
    setFileName(null);
    setStatus('disconnected');
    setLastSaved(null);
    clearStoredFileHandle();
  }, []);

  // Save data to file
  const saveData = useCallback(async (
    habits: Habit[],
    areas: Area[],
    entries: HabitEntry[]
  ): Promise<boolean> => {
    if (!fileHandleRef.current || status !== 'connected') {
      return false;
    }

    try {
      setStatus('saving');
      const data = createExportData(habits, areas, entries);
      await writeToFile(fileHandleRef.current, data);
      setLastSaved(new Date());
      setStatus('connected');
      setError(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
      return false;
    }
  }, [status]);

  return (
    <FileStorageContext.Provider
      value={{
        status,
        fileName,
        lastSaved,
        error,
        connectFile,
        openExistingFile,
        disconnectFile,
        saveData,
        requestPermission,
      }}
    >
      {children}
    </FileStorageContext.Provider>
  );
}

export function useFileStorage() {
  const context = useContext(FileStorageContext);
  if (!context) {
    throw new Error('useFileStorage must be used within a FileStorageProvider');
  }
  return context;
}
