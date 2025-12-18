import { Habit, Area, HabitEntry } from './types';

const STORAGE_KEYS = {
  HABITS: 'habit-tracker-habits',
  AREAS: 'habit-tracker-areas',
  ENTRIES: 'habit-tracker-entries',
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Habits
export function getHabits(): Habit[] {
  return getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
}

export function saveHabits(habits: Habit[]): void {
  setItem(STORAGE_KEYS.HABITS, habits);
}

// Areas
export function getAreas(): Area[] {
  const defaultAreas: Area[] = [
    { id: 'morning', name: 'Morning', order: 0 },
    { id: 'afternoon', name: 'Afternoon', order: 1 },
    { id: 'evening', name: 'Evening', order: 2 },
  ];
  return getItem<Area[]>(STORAGE_KEYS.AREAS, defaultAreas);
}

export function saveAreas(areas: Area[]): void {
  setItem(STORAGE_KEYS.AREAS, areas);
}

// Entries
export function getEntries(): HabitEntry[] {
  return getItem<HabitEntry[]>(STORAGE_KEYS.ENTRIES, []);
}

export function saveEntries(entries: HabitEntry[]): void {
  setItem(STORAGE_KEYS.ENTRIES, entries);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
