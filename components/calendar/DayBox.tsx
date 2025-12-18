'use client';

import { motion } from 'framer-motion';
import { EntryStatus } from '@/lib/types';
import { formatDateForDisplay, isToday, isFuture } from '@/lib/dates';

interface DayBoxProps {
  date: Date;
  status: EntryStatus;
  isActive: boolean; // Whether this day is an active day for the habit
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export default function DayBox({
  date,
  status,
  isActive,
  onClick,
  size = 'sm',
  showTooltip = true,
}: DayBoxProps) {
  const today = isToday(date);
  const future = isFuture(date);

  const getStatusClass = () => {
    if (!isActive) return 'day-inactive';
    if (status === 'done') return 'day-done';
    if (status === 'failed') return 'day-failed';
    return 'day-blank';
  };

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const content = (
    <motion.button
      whileHover={isActive && !future ? { scale: 1.3 } : undefined}
      whileTap={isActive && !future ? { scale: 0.9 } : undefined}
      onClick={onClick}
      disabled={!isActive || future}
      className={`
        ${sizes[size]}
        ${getStatusClass()}
        rounded-sm
        ${today ? 'ring-2 ring-blue-500 dark:ring-white/50 ring-offset-1 ring-offset-white dark:ring-offset-black' : ''}
        ${isActive && !future ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        ${future ? 'opacity-30' : ''}
        transition-all
      `}
      title={showTooltip ? `${formatDateForDisplay(date)}${status ? ` - ${status}` : ''}` : undefined}
    />
  );

  return content;
}
