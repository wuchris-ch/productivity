'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabits } from '@/context/HabitContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getDayName } from '@/lib/dates';

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export default function CreateHabitModal() {
  const { addHabit, areas } = useHabits();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[5]);
  const [areaId, setAreaId] = useState('');
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor(COLORS[5]);
    setAreaId(areas[0]?.id || '');
    setActiveDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && areaId && activeDays.length > 0) {
      addHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        areaId,
        activeDays,
      });
      resetForm();
      setIsOpen(false);
    }
  };

  const toggleDay = (day: number) => {
    setActiveDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <>
      <Button onClick={() => {
        if (areas.length > 0) {
          setAreaId(areas[0].id);
        }
        setIsOpen(true);
      }} className="gap-2">
        <Plus size={18} />
        New Habit
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          setIsOpen(false);
        }}
        title="Create New Habit"
        size="md"
      >
        {areas.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-white/50 mb-4">
              You need to create an area first before adding habits.
            </p>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning meditation"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 10 minutes of mindfulness"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Area *
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id} className="bg-white dark:bg-zinc-900">
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Active Days */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Active Days *
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      activeDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/60'
                    }`}
                  >
                    {getDayName(day)}
                  </button>
                ))}
              </div>
              {activeDays.length === 0 && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  Select at least one day
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !areaId || activeDays.length === 0}
              >
                Create Habit
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
