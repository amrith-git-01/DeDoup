import React from 'react';
import { List, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

import type { ViewModeToggleProps, ViewMode } from '../../types/ui';

const OPTIONS: Array<{ id: ViewMode; label: string; icon: React.ComponentType<any> }> = [
  { id: 'list', label: 'List', icon: List },
  { id: 'pie', label: 'Pie', icon: PieIcon },
  { id: 'bar', label: 'Bar', icon: BarChart2 },
];

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ value, onChange, className }) => {
  return (
    <div className={clsx('flex bg-gray-100 p-1 rounded-lg', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          aria-label={opt.label}
          onClick={() => onChange(opt.id)}
          className={clsx(
            'p-1.5 rounded-md transition-all cursor-pointer',
            value === opt.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <opt.icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
};
