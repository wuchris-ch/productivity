'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useHabits } from '@/context/HabitContext';
import Area from '@/components/areas/Area';
import HabitCard from '@/components/habits/HabitCard';
import { Habit } from '@/lib/types';

export default function QuickView() {
  const { habits, areas, moveHabit, reorderHabits } = useHabits();
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedAreas = useMemo(
    () => [...areas].sort((a, b) => a.order - b.order),
    [areas]
  );

  const habitsByArea = useMemo(() => {
    const grouped: Record<string, Habit[]> = {};
    areas.forEach(area => {
      grouped[area.id] = habits
        .filter(h => h.areaId === area.id)
        .sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [habits, areas]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const habit = habits.find(h => h.id === active.id);
    if (habit) {
      setActiveHabit(habit);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveHabit(null);
    setOverId(null);

    if (!over) return;

    const activeHabit = habits.find(h => h.id === active.id);
    if (!activeHabit) return;

    const overId = over.id as string;

    // Check if dropped on an area
    const targetArea = areas.find(a => a.id === overId);
    if (targetArea) {
      // Dropped directly on an area - move to end of that area
      if (activeHabit.areaId !== targetArea.id) {
        const targetHabits = habitsByArea[targetArea.id] || [];
        moveHabit(activeHabit.id, targetArea.id, targetHabits.length);
      }
      return;
    }

    // Dropped on another habit
    const overHabit = habits.find(h => h.id === overId);
    if (overHabit) {
      if (activeHabit.areaId === overHabit.areaId) {
        // Reorder within same area
        const areaHabits = habitsByArea[activeHabit.areaId];
        const oldIndex = areaHabits.findIndex(h => h.id === active.id);
        const newIndex = areaHabits.findIndex(h => h.id === over.id);

        if (oldIndex !== newIndex) {
          const newOrder = arrayMove(areaHabits, oldIndex, newIndex);
          reorderHabits(activeHabit.areaId, newOrder.map(h => h.id));
        }
      } else {
        // Move to different area at specific position
        const targetAreaHabits = habitsByArea[overHabit.areaId];
        const targetIndex = targetAreaHabits.findIndex(h => h.id === overId);
        moveHabit(activeHabit.id, overHabit.areaId, targetIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {sortedAreas.map(area => (
          <Area
            key={area.id}
            area={area}
            habits={habitsByArea[area.id] || []}
            isOver={overId === area.id}
          >
            {(habitsByArea[area.id] || []).map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDragging={activeHabit?.id === habit.id}
              />
            ))}
          </Area>
        ))}
      </div>

      {/* Drag Overlay - snappy drop animation */}
      <DragOverlay dropAnimation={{
        duration: 150,
        easing: 'ease-out',
      }}>
        {activeHabit ? (
          <div className="drag-overlay rounded-lg shadow-xl">
            <HabitCard habit={activeHabit} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
