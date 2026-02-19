import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

import type { OverviewCardProps } from '../../types/metrics';

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-gray-400',
  change,
  onClick,
  colSpan = 1,
}) => {
  return (
    <div className={`col-span-${colSpan} h-full`}>
      <div
        className="ui-hover-card h-full bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-between cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <p className="text-[10px] font-bold text-gray-400 uppercase">{title}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p
              className={`font-bold font-tabular-nums text-gray-900 ${colSpan === 2 ? 'text-3xl' : 'text-xl'}`}
            >
              {value}
            </p>
            {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
          </div>

          {change && (
            <p
              className={`text-[11px] flex items-center gap-1.5 font-medium ${
                change.value > 0
                  ? 'text-green-600'
                  : change.value < 0
                    ? 'text-red-600'
                    : 'text-gray-500'
              }`}
            >
              {change.value > 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : change.value < 0 ? (
                <ArrowDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {Math.abs(change.value)} {change.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
