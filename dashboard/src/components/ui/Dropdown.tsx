import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

import type { DropdownProps, DropdownOption } from '../../types/ui';

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  align = 'right',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find((o) => o.value === value) ?? options[0];

  const handleSelect = (next: DropdownOption) => {
    onChange(next.value);
    setIsOpen(false);
  };

  const menuAlignmentClass = align === 'right' ? 'right-0' : 'left-0';

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-1.5' : 'text-xs px-3 py-2';

  return (
    <div className={clsx('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className={clsx(
          'flex items-center gap-2 font-medium bg-gray-100 rounded-lg cursor-pointer',
          'hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
          sizeClasses,
          buttonClassName,
        )}
      >
        <span>{selected?.label}</span>
        <div className={clsx('dropdown-arrow', isOpen && 'dropdown-arrow--open')}>
          <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
        </div>
      </button>

      {isOpen && (
        <div
          className={clsx(
            'anim-pop-in absolute mt-2 w-full bg-white rounded-lg shadow-lg',
            'border border-gray-200 py-1 z-10',
            menuAlignmentClass,
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => {
                // prevent blur before onClick so selection works reliably
                e.preventDefault();
                handleSelect(opt);
              }}
              className={clsx(
                'w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer',
                opt.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
