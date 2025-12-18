export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  areaId: string;
  activeDays: number[]; // 0-6 for Sun-Sat
  createdAt: string;
  order: number;
}

export interface Area {
  id: string;
  name: string;
  order: number;
}

export type EntryStatus = 'done' | 'failed' | null;

export interface HabitEntry {
  habitId: string;
  date: string; // YYYY-MM-DD
  status: EntryStatus;
}

export type ViewMode = 'quick' | 'calendar';

export type Theme = 'light' | 'dark';
