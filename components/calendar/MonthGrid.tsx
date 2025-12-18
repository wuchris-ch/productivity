'use client';

import { useMemo } from 'react';
import DayBox from './DayBox';
import { Habit, EntryStatus } from '@/lib/types';
import { getDaysInMonth, getFirstDayOfMonth, getShortMonthName } from '@/lib/dates';
import { useHabits } from '@/context/HabitContext';

interface MonthGridProps {
  habit: Habit;
  year: number;
  month: number; // 0-11
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  compact?: boolean;
}

export default function MonthGrid({
  habit,
  year,
  month,
  size = 'sm',
  showHeader = true,
  compact = false,
}: MonthGridProps) {
  const { getEntryStatus, toggleEntry } = useHabits();

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const result: (Date | null)[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(new Date(year, month, day));
    }

    return result;
  }, [year, month]);

  const handleDayClick = (date: Date) => {
    toggleEntry(habit.id, date);
  };

  const isActiveDay = (date: Date): boolean => {
    return habit.activeDays.includes(date.getDay());
  };

  const gaps = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div className={compact ? '' : 'space-y-1'}>
      {showHeader && (
        <div className="text-xs text-gray-500 dark:text-white/50 font-medium mb-1">
          {getShortMonthName(month)} {year}
        </div>
      )}

      <div className={`grid grid-cols-7 ${gaps[size]}`}>
        {days.map((date, index) => (
          <div key={index} className="flex items-center justify-center">
            {date ? (
              <DayBox
                date={date}
                status={getEntryStatus(habit.id, date)}
                isActive={isActiveDay(date)}
                onClick={() => handleDayClick(date)}
                size={size}
                showTooltip={true}
              />
            ) : (
              <div className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
