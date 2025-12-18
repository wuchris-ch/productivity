'use client';

import { useFileStorage, FileStorageStatus as Status } from '@/context/FileStorageContext';
import { useHabits } from '@/context/HabitContext';
import { useEffect, useRef } from 'react';
import { HardDrive, Check, AlertCircle, Loader2, FolderOpen, Unplug } from 'lucide-react';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function FileStorageStatus() {
  const {
    status,
    fileName,
    lastSaved,
    error,
    connectFile,
    openExistingFile,
    disconnectFile,
    saveData,
    requestPermission,
  } = useFileStorage();

  const { habits, areas, entries, onDataChange, loadData } = useHabits();

  // Ref to track if we've done initial setup
  const isSubscribedRef = useRef(false);

  // Subscribe to data changes and auto-save
  useEffect(() => {
    if (status !== 'connected' && status !== 'saving') {
      isSubscribedRef.current = false;
      return;
    }

    // Only subscribe once when connected
    if (isSubscribedRef.current) return;
    isSubscribedRef.current = true;

    const unsubscribe = onDataChange((h, a, e) => {
      saveData(h, a, e);
    });

    return () => {
      unsubscribe();
      isSubscribedRef.current = false;
    };
  }, [status, onDataChange, saveData]);

  // Handle opening existing file and loading data
  const handleOpenExisting = async () => {
    const data = await openExistingFile();
    if (data) {
      loadData(data.habits, data.areas, data.entries);
    }
  };

  // Status-specific rendering
  if (status === 'unsupported') {
    return null; // Don't show anything if unsupported
  }

  const statusConfig: Record<Status, { icon: React.ReactNode; text: string; color: string }> = {
    unsupported: { icon: null, text: '', color: '' },
    disconnected: {
      icon: <HardDrive size={14} />,
      text: 'No file connected',
      color: 'text-gray-500 dark:text-white/40',
    },
    connecting: {
      icon: <Loader2 size={14} className="animate-spin" />,
      text: 'Connecting...',
      color: 'text-gray-500 dark:text-white/40',
    },
    permission: {
      icon: <AlertCircle size={14} />,
      text: 'Permission needed',
      color: 'text-amber-500',
    },
    connected: {
      icon: <Check size={14} />,
      text: fileName || 'Connected',
      color: 'text-emerald-500',
    },
    saving: {
      icon: <Loader2 size={14} className="animate-spin" />,
      text: 'Saving...',
      color: 'text-blue-500',
    },
    error: {
      icon: <AlertCircle size={14} />,
      text: error || 'Error',
      color: 'text-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Status indicator */}
      <div className={`flex items-center gap-1.5 ${config.color}`}>
        {config.icon}
        <span className="hidden sm:inline">{config.text}</span>
      </div>

      {/* Last saved time */}
      {status === 'connected' && lastSaved && (
        <span className="text-gray-400 dark:text-white/30 hidden sm:inline">
          {formatTimeAgo(lastSaved)}
        </span>
      )}

      {/* Action buttons */}
      {status === 'disconnected' && (
        <div className="flex items-center gap-1">
          <button
            onClick={connectFile}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 transition-colors"
          >
            New File
          </button>
          <button
            onClick={handleOpenExisting}
            className="p-1 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 transition-colors"
            title="Open existing file"
          >
            <FolderOpen size={14} />
          </button>
        </div>
      )}

      {status === 'permission' && (
        <button
          onClick={requestPermission}
          className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 transition-colors"
        >
          Allow
        </button>
      )}

      {status === 'connected' && (
        <button
          onClick={disconnectFile}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-white/30 transition-colors"
          title="Disconnect file"
        >
          <Unplug size={14} />
        </button>
      )}

      {status === 'error' && (
        <button
          onClick={connectFile}
          className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
