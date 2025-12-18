'use client';

import { useMemo } from 'react';
import MonthGrid from './MonthGrid';
import { Habit } from '@/lib/types';
import { getYearMonths } from '@/lib/dates';

interface YearGridProps {
  habit: Habit;
  year: number;
}

export default function YearGrid({ habit, year }: YearGridProps) {
  const months = useMemo(() => getYearMonths(year), [year]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
      {months.map(({ year: y, month }) => (
        <MonthGrid
          key={`${y}-${month}`}
          habit={habit}
          year={y}
          month={month}
          size="md"
          showHeader={true}
        />
      ))}
    </div>
  );
}
