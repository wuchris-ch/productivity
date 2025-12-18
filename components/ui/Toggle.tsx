'use client';

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
            value === option.value
              ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
