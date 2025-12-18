'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabits } from '@/context/HabitContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function AreaManager() {
  const { addArea } = useHabits();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addArea(name.trim());
      setName('');
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <Plus size={16} />
        Add Area
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Area" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
              Area Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Routine"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Area
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
