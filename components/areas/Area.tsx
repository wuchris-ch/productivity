'use client';

import { useState, ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { Area as AreaType, Habit } from '@/lib/types';
import { useHabits } from '@/context/HabitContext';

interface AreaProps {
  area: AreaType;
  habits: Habit[];
  children: ReactNode;
  isOver?: boolean;
}

export default function Area({ area, habits, children, isOver }: AreaProps) {
  const { updateArea, deleteArea } = useHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(area.name);
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef } = useDroppable({
    id: area.id,
    data: { type: 'area', area },
  });

  const handleSaveName = () => {
    if (editName.trim()) {
      updateArea(area.id, { name: editName.trim() });
    } else {
      setEditName(area.name);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (habits.length > 0) {
      const confirmed = window.confirm(
        `This area has ${habits.length} habit(s). They will be moved to another area. Continue?`
      );
      if (!confirmed) return;
    }
    deleteArea(area.id);
    setShowMenu(false);
  };

  const habitIds = habits.map(h => h.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-gray-50 dark:bg-white/[0.02] rounded-xl border transition-all duration-200
        ${isOver ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-200 dark:border-white/5'}
      `}
    >
      {/* Area Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/5">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setEditName(area.name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-green-500 dark:text-green-400"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setEditName(area.name);
                setIsEditing(false);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80">{area.name}</h3>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-20 min-w-[140px]"
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Pencil size={14} />
                      Rename
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Habits Container */}
      <SortableContext items={habitIds} strategy={verticalListSortingStrategy}>
        <div className="p-3 min-h-[80px] space-y-2">
          {children}
          {habits.length === 0 && !isOver && (
            <div className="text-center py-6 text-gray-400 dark:text-white/20 text-sm">
              Drop habits here
            </div>
          )}
          {isOver && habits.length === 0 && (
            <div className="h-16 border-2 border-dashed border-blue-500/30 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-400/50 text-sm">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
