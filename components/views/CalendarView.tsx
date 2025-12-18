'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '@/context/HabitContext';
import HabitCardCalendar from '@/components/habits/HabitCardCalendar';

export default function CalendarView() {
  const { habits, areas } = useHabits();

  const sortedHabits = useMemo(() => {
    // Sort habits by area order, then by habit order within area
    const areaOrderMap = new Map(areas.map(a => [a.id, a.order]));

    return [...habits].sort((a, b) => {
      const aAreaOrder = areaOrderMap.get(a.areaId) ?? 0;
      const bAreaOrder = areaOrderMap.get(b.areaId) ?? 0;

      if (aAreaOrder !== bAreaOrder) {
        return aAreaOrder - bAreaOrder;
      }
      return a.order - b.order;
    });
  }, [habits, areas]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-white/40 text-lg">No habits yet</p>
        <p className="text-gray-400 dark:text-white/25 mt-2">Create a habit to see the calendar view</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {sortedHabits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <HabitCardCalendar habit={habit} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
