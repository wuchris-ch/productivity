'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Flame,
  Trophy,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Save,
} from 'lucide-react';
import { useHabits } from '@/context/HabitContext';
import YearGrid from '@/components/calendar/YearGrid';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { calculateStats } from '@/lib/statistics';
import { getDayName } from '@/lib/dates';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

function HabitDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { habits, areas, entries, updateHabit, deleteHabit, toggleEntry, getEntryStatus } = useHabits();

  const habit = habits.find(h => h.id === id);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editAreaId, setEditAreaId] = useState('');
  const [editActiveDays, setEditActiveDays] = useState<number[]>([]);

  const stats = useMemo(() => {
    if (!habit) return null;
    return calculateStats(habit, entries);
  }, [habit, entries]);

  const today = new Date();
  const todayStatus = habit ? getEntryStatus(habit.id, today) : null;
  const isTodayActive = habit ? habit.activeDays.includes(today.getDay()) : false;

  const startEditing = () => {
    if (!habit) return;
    setEditName(habit.name);
    setEditDescription(habit.description || '');
    setEditColor(habit.color);
    setEditAreaId(habit.areaId);
    setEditActiveDays([...habit.activeDays]);
    setIsEditing(true);
  };

  const saveChanges = () => {
    if (!habit || !editName.trim() || editActiveDays.length === 0) return;

    updateHabit(habit.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      color: editColor,
      areaId: editAreaId,
      activeDays: editActiveDays,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!habit) return;
    deleteHabit(habit.id);
    router.push('/');
  };

  const toggleEditDay = (day: number) => {
    setEditActiveDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleToggleToday = () => {
    if (habit && isTodayActive) {
      toggleEntry(habit.id, today);
    }
  };

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <p className="text-gray-500 dark:text-white/50 text-lg">Habit not found</p>
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mt-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const area = areas.find(a => a.id === habit.areaId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="gap-1.5"
              >
                <Pencil size={16} />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="gap-1.5 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Habit Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-2 h-16 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{habit.name}</h1>
              {habit.description && (
                <p className="text-gray-500 dark:text-white/50 mt-1">{habit.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-400 dark:text-white/30">
                  Area: <span className="text-gray-500 dark:text-white/50">{area?.name}</span>
                </span>
                <span className="text-sm text-gray-400 dark:text-white/30">
                  Active: <span className="text-gray-500 dark:text-white/50">
                    {habit.activeDays.map(d => getDayName(d)).join(', ')}
                  </span>
                </span>
              </div>
            </div>

            {/* Today's Status */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-white/40">Today</span>
              {!isTodayActive ? (
                <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/30 text-sm">
                  Rest day
                </div>
              ) : todayStatus === 'done' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleToday}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium shadow-lg shadow-green-500/20"
                >
                  <Check size={18} strokeWidth={3} />
                  Done
                </motion.button>
              ) : todayStatus === 'failed' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleToday}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/20"
                >
                  <X size={18} strokeWidth={3} />
                  Missed
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleToday}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/15 font-medium"
                >
                  <Check size={18} />
                  Mark Done
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400 mb-2">
                <Flame size={20} />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">days</p>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 mb-2">
                <Trophy size={20} />
                <span className="text-sm font-medium">Longest Streak</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.longestStreak}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">days</p>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-green-500 dark:text-green-400 mb-2">
                <Target size={20} />
                <span className="text-sm font-medium">30-Day Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">completion</p>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                <Calendar size={20} />
                <span className="text-sm font-medium">Total Days</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCompletions}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                of {stats.totalDays} ({stats.totalFailed} missed)
              </p>
            </div>
          </motion.div>
        )}

        {/* Year Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none"
        >
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentYear} Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentYear(y => y - 1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentYear(new Date().getFullYear())}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentYear(y => y + 1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm day-done" />
              <span className="text-gray-500 dark:text-white/50">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm day-failed" />
              <span className="text-gray-500 dark:text-white/50">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm day-blank" />
              <span className="text-gray-500 dark:text-white/50">Not marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm day-inactive" />
              <span className="text-gray-500 dark:text-white/50">Rest day</span>
            </div>
          </div>

          <YearGrid habit={habit} year={currentYear} />
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Habit"
        size="md"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Description
            </label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Area
            </label>
            <select
              value={editAreaId}
              onChange={(e) => setEditAreaId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="bg-white dark:bg-zinc-900">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    editColor === c ? 'ring-2 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Active Days */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Active Days
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleEditDay(day)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    editActiveDays.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/60'
                  }`}
                >
                  {getDayName(day)}
                </button>
              ))}
            </div>
            {editActiveDays.length === 0 && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">Select at least one day</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveChanges}
              disabled={!editName.trim() || editActiveDays.length === 0}
              className="gap-2"
            >
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Habit"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-white/70">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{habit.name}</strong>?
            This will also delete all tracking data for this habit.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Habit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function HabitDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-pulse text-gray-500 dark:text-white/50">Loading...</div>
      </div>
    }>
      <HabitDetailContent />
    </Suspense>
  );
}
