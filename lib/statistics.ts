import { Habit, HabitEntry, EntryStatus } from './types';
import { formatDate, parseDate, isPast, isToday } from './dates';

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // Last 30 days
  totalCompletions: number;
  totalFailed: number;
  totalDays: number;
}

function isActiveDay(date: Date, activeDays: number[]): boolean {
  return activeDays.includes(date.getDay());
}

function getEntryStatus(
  habitId: string,
  date: Date,
  entries: HabitEntry[]
): EntryStatus {
  const dateStr = formatDate(date);
  const entry = entries.find(
    e => e.habitId === habitId && e.date === dateStr
  );
  return entry?.status ?? null;
}

export function calculateStats(
  habit: Habit,
  entries: HabitEntry[]
): HabitStats {
  const habitEntries = entries.filter(e => e.habitId === habit.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate total completions and failed
  const totalCompletions = habitEntries.filter(e => e.status === 'done').length;
  const totalFailed = habitEntries.filter(e => e.status === 'failed').length;

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let activeDaysInPeriod = 0;
  let completedInPeriod = 0;

  for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    if (isActiveDay(d, habit.activeDays)) {
      activeDaysInPeriod++;
      const status = getEntryStatus(habit.id, new Date(d), entries);
      if (status === 'done') completedInPeriod++;
    }
  }

  const completionRate = activeDaysInPeriod > 0
    ? Math.round((completedInPeriod / activeDaysInPeriod) * 100)
    : 0;

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date(today);

  // Start from today and go backwards
  while (true) {
    if (isActiveDay(checkDate, habit.activeDays)) {
      const status = getEntryStatus(habit.id, checkDate, entries);

      // For today, if no entry yet, skip and check yesterday
      if (isToday(checkDate) && status === null) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (status === 'done') {
        currentStreak++;
      } else {
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);

    // Don't go back more than a year
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (checkDate < oneYearAgo) break;
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  // Get all entries sorted by date
  const sortedEntries = [...habitEntries]
    .filter(e => e.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedEntries.length > 0) {
    const firstDate = parseDate(sortedEntries[0].date);
    const lastDate = parseDate(sortedEntries[sortedEntries.length - 1].date);

    for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
      if (isActiveDay(d, habit.activeDays)) {
        const status = getEntryStatus(habit.id, new Date(d), entries);
        if (status === 'done') {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
    }
  }

  // Calculate total active days since habit creation
  const createdDate = parseDate(habit.createdAt);
  let totalDays = 0;
  for (let d = new Date(createdDate); d <= today; d.setDate(d.getDate() + 1)) {
    if (isActiveDay(d, habit.activeDays)) {
      totalDays++;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completionRate,
    totalCompletions,
    totalFailed,
    totalDays,
  };
}
