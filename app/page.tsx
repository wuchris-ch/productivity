'use client';

import { useHabits } from '@/context/HabitContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '@/components/ui/Toggle';
import QuickView from '@/components/views/QuickView';
import CalendarView from '@/components/views/CalendarView';
import CreateHabitModal from '@/components/habits/CreateHabitModal';
import AreaManager from '@/components/areas/AreaManager';
import FileStorageStatus from '@/components/ui/FileStorageStatus';
import { ViewMode } from '@/lib/types';

export default function HomePage() {
  const { viewMode, setViewMode, habits, areas, theme, toggleTheme } = useHabits();

  const viewOptions = [
    { value: 'quick', label: 'Quick View' },
    { value: 'calendar', label: 'Calendar View' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
              <FileStorageStatus />
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                options={viewOptions}
                value={viewMode}
                onChange={(value) => setViewMode(value as ViewMode)}
              />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreateHabitModal />
            {viewMode === 'quick' && <AreaManager />}
          </div>

          <div className="text-sm text-gray-500 dark:text-white/40">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} • {areas.length} area{areas.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Empty State */}
        {habits.length === 0 && areas.length > 0 && (
          <div className="text-center py-16 bg-gray-100 dark:bg-white/[0.02] rounded-xl border border-gray-200 dark:border-white/5">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No habits yet</h2>
            <p className="text-gray-500 dark:text-white/40 mb-6">
              Create your first habit to start tracking your daily routines
            </p>
            <CreateHabitModal />
          </div>
        )}

        {/* Views */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {viewMode === 'quick' ? <QuickView /> : <CalendarView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
