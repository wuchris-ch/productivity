'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Habit } from '@/lib/types';
import { useHabits } from '@/context/HabitContext';

interface HabitCardProps {
  habit: Habit;
  isDragging?: boolean;
}

export default function HabitCard({ habit, isDragging }: HabitCardProps) {
  const { getEntryStatus, toggleEntry } = useHabits();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: habit.id,
    data: { type: 'habit', habit },
  });

  // Only apply transition when NOT actively dragging (for the drop animation)
  // During drag, we want instant/snappy transforms with no delay
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? 'none' : transition,
    willChange: isSortableDragging ? 'transform' : undefined,
  };

  const today = new Date();
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
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/20">
          <span className="text-xs">N/A</span>
        </div>
      );
    }

    if (todayStatus === 'done') {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleToday}
          className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20"
        >
          <Check size={20} strokeWidth={3} />
        </motion.button>
      );
    }

    if (todayStatus === 'failed') {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleToday}
          className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20"
        >
          <X size={20} strokeWidth={3} />
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleToday}
        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 hover:border-gray-400 dark:hover:border-white/40 hover:bg-gray-200 dark:hover:bg-white/15"
      >
        <Check size={18} />
      </motion.button>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group
        bg-white dark:bg-white/[0.03]
        border border-gray-200 dark:border-white/5
        rounded-lg
        overflow-hidden
        shadow-sm dark:shadow-none
        ${isSortableDragging || isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 touch-none"
        >
          <GripVertical size={16} />
        </div>

        {/* Color Indicator */}
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: habit.color }}
        />

        {/* Habit Info */}
        <Link
          href={`/habit?id=${habit.id}`}
          className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{habit.name}</h4>
          {habit.description && (
            <p className="text-xs text-gray-500 dark:text-white/40 truncate mt-0.5">
              {habit.description}
            </p>
          )}
        </Link>

        {/* Today's Status Button */}
        {getStatusButton()}
      </div>
    </div>
  );
}
