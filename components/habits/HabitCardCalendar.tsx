'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Habit } from '@/lib/types';
import { useHabits } from '@/context/HabitContext';
import MonthGrid from '@/components/calendar/MonthGrid';

interface HabitCardCalendarProps {
  habit: Habit;
}

export default function HabitCardCalendar({ habit }: HabitCardCalendarProps) {
  const { getEntryStatus, toggleEntry } = useHabits();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate previous and next month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const todayStatus = getEntryStatus(habit.id, today);
  const isTodayActive = habit.activeDays.includes(today.getDay());

  const handleToggleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTodayActive) {
      toggleEntry(habit.id, today);
    }
  };

  const getStatusButton = () => {
    if (!isTodayActive) {
      return (
        <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/30 text-sm">
          Not scheduled today
        </div>
      );
    }

    if (todayStatus === 'done') {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleToday}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium shadow-lg shadow-green-500/20"
        >
          <Check size={18} strokeWidth={3} />
          Completed
        </motion.button>
      );
    }

    if (todayStatus === 'failed') {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleToday}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/20"
        >
          <X size={18} strokeWidth={3} />
          Missed
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggleToday}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/15 font-medium"
      >
        <Check size={18} />
        Mark Complete
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm dark:shadow-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <Link href={`/habit?id=${habit.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div
            className="w-3 h-8 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
            {habit.description && (
              <p className="text-xs text-gray-500 dark:text-white/40">{habit.description}</p>
            )}
          </div>
        </Link>

        {getStatusButton()}
      </div>

      {/* Calendar Grids */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="opacity-60">
            <MonthGrid
              habit={habit}
              year={prevYear}
              month={prevMonth}
              size="sm"
              showHeader={true}
            />
          </div>
          <div>
            <MonthGrid
              habit={habit}
              year={currentYear}
              month={currentMonth}
              size="sm"
              showHeader={true}
            />
          </div>
          <div className="opacity-60">
            <MonthGrid
              habit={habit}
              year={nextYear}
              month={nextMonth}
              size="sm"
              showHeader={true}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
