'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Habit, Area, HabitEntry, EntryStatus, ViewMode, Theme } from '@/lib/types';
import {
  getHabits,
  saveHabits,
  getAreas,
  saveAreas,
  getEntries,
  saveEntries,
  generateId,
} from '@/lib/storage';
import { formatDate } from '@/lib/dates';

interface HabitContextType {
  habits: Habit[];
  areas: Area[];
  entries: HabitEntry[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  moveHabit: (habitId: string, targetAreaId: string, newOrder: number) => void;
  reorderHabits: (areaId: string, habitIds: string[]) => void;

  // Area actions
  addArea: (name: string) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  reorderAreas: (areaIds: string[]) => void;

  // Entry actions
  toggleEntry: (habitId: string, date: Date) => void;
  getEntryStatus: (habitId: string, date: Date) => EntryStatus;

  // Data sync
  loadData: (habits: Habit[], areas: Area[], entries: HabitEntry[]) => void;
  onDataChange: (callback: (habits: Habit[], areas: Area[], entries: HabitEntry[]) => void) => () => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('quick');
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Data change subscribers
  const dataChangeCallbacksRef = useRef<Set<(habits: Habit[], areas: Area[], entries: HabitEntry[]) => void>>(new Set());

  // Load data from localStorage on mount
  useEffect(() => {
    setHabits(getHabits());
    setAreas(getAreas());
    setEntries(getEntries());

    // Load theme preference
    const savedTheme = localStorage.getItem('habit-tracker-theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    setIsLoaded(true);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (isLoaded) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('habit-tracker-theme', theme);
    }
  }, [theme, isLoaded]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Save habits when changed
  useEffect(() => {
    if (isLoaded) saveHabits(habits);
  }, [habits, isLoaded]);

  // Save areas when changed
  useEffect(() => {
    if (isLoaded) saveAreas(areas);
  }, [areas, isLoaded]);

  // Save entries when changed
  useEffect(() => {
    if (isLoaded) saveEntries(entries);
  }, [entries, isLoaded]);

  // Notify subscribers when data changes
  useEffect(() => {
    if (isLoaded) {
      dataChangeCallbacksRef.current.forEach(callback => {
        callback(habits, areas, entries);
      });
    }
  }, [habits, areas, entries, isLoaded]);

  // Load data from external source (e.g., file)
  const loadData = useCallback((newHabits: Habit[], newAreas: Area[], newEntries: HabitEntry[]) => {
    setHabits(newHabits);
    setAreas(newAreas);
    setEntries(newEntries);
  }, []);

  // Subscribe to data changes
  const onDataChange = useCallback((callback: (habits: Habit[], areas: Area[], entries: HabitEntry[]) => void) => {
    dataChangeCallbacksRef.current.add(callback);
    return () => {
      dataChangeCallbacksRef.current.delete(callback);
    };
  }, []);

  // Habit actions
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    const areaHabits = habits.filter(h => h.areaId === habit.areaId);
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: formatDate(new Date()),
      order: areaHabits.length,
    };
    setHabits(prev => [...prev, newHabit]);
  }, [habits]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setEntries(prev => prev.filter(e => e.habitId !== id));
  }, []);

  const moveHabit = useCallback((habitId: string, targetAreaId: string, newOrder: number) => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === habitId);
      if (!habit) return prev;

      const otherHabits = prev.filter(h => h.id !== habitId);
      const targetAreaHabits = otherHabits
        .filter(h => h.areaId === targetAreaId)
        .sort((a, b) => a.order - b.order);

      // Insert at new position
      targetAreaHabits.splice(newOrder, 0, { ...habit, areaId: targetAreaId });

      // Reorder
      const reorderedTargetHabits = targetAreaHabits.map((h, i) => ({
        ...h,
        order: i,
      }));

      const remainingHabits = otherHabits.filter(h => h.areaId !== targetAreaId);

      return [...remainingHabits, ...reorderedTargetHabits];
    });
  }, []);

  const reorderHabits = useCallback((areaId: string, habitIds: string[]) => {
    setHabits(prev => {
      const otherHabits = prev.filter(h => h.areaId !== areaId);
      const reorderedHabits = habitIds.map((id, index) => {
        const habit = prev.find(h => h.id === id);
        return habit ? { ...habit, order: index } : null;
      }).filter((h): h is Habit => h !== null);

      return [...otherHabits, ...reorderedHabits];
    });
  }, []);

  // Area actions
  const addArea = useCallback((name: string) => {
    const newArea: Area = {
      id: generateId(),
      name,
      order: areas.length,
    };
    setAreas(prev => [...prev, newArea]);
  }, [areas.length]);

  const updateArea = useCallback((id: string, updates: Partial<Area>) => {
    setAreas(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteArea = useCallback((id: string) => {
    // Move habits from deleted area to first available area
    const remainingAreas = areas.filter(a => a.id !== id);
    if (remainingAreas.length > 0) {
      const targetArea = remainingAreas[0];
      setHabits(prev =>
        prev.map(h =>
          h.areaId === id ? { ...h, areaId: targetArea.id } : h
        )
      );
    } else {
      // Delete all habits if no areas left
      setHabits(prev => prev.filter(h => h.areaId !== id));
    }
    setAreas(prev => prev.filter(a => a.id !== id));
  }, [areas]);

  const reorderAreas = useCallback((areaIds: string[]) => {
    setAreas(prev => {
      return areaIds.map((id, index) => {
        const area = prev.find(a => a.id === id);
        return area ? { ...area, order: index } : null;
      }).filter((a): a is Area => a !== null);
    });
  }, []);

  // Entry actions
  const toggleEntry = useCallback((habitId: string, date: Date) => {
    const dateStr = formatDate(date);

    setEntries(prev => {
      const existingIndex = prev.findIndex(
        e => e.habitId === habitId && e.date === dateStr
      );

      if (existingIndex === -1) {
        // No entry - create as done
        return [...prev, { habitId, date: dateStr, status: 'done' as EntryStatus }];
      }

      const existing = prev[existingIndex];
      const newEntries = [...prev];

      if (existing.status === 'done') {
        // Done -> Failed
        newEntries[existingIndex] = { ...existing, status: 'failed' as EntryStatus };
      } else if (existing.status === 'failed') {
        // Failed -> Remove (blank)
        newEntries.splice(existingIndex, 1);
      }

      return newEntries;
    });
  }, []);

  const getEntryStatus = useCallback((habitId: string, date: Date): EntryStatus => {
    const dateStr = formatDate(date);
    const entry = entries.find(
      e => e.habitId === habitId && e.date === dateStr
    );
    return entry?.status ?? null;
  }, [entries]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-pulse text-gray-500 dark:text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        areas,
        entries,
        viewMode,
        setViewMode,
        theme,
        setTheme,
        toggleTheme,
        addHabit,
        updateHabit,
        deleteHabit,
        moveHabit,
        reorderHabits,
        addArea,
        updateArea,
        deleteArea,
        reorderAreas,
        toggleEntry,
        getEntryStatus,
        loadData,
        onDataChange,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
