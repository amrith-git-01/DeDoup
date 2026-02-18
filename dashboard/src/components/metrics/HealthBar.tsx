import { memo } from 'react';
import type { HealthBarProps } from '../../types/metrics';

const HealthBar = ({
  unique,
  duplicates,
  total,
  title = 'Downloads Health',
  subtitle = 'Distribution of unique vs duplicate files',
  labels = { unique: 'Unique', duplicates: 'Duplicate', total: 'Total' },
  formatter = (val: number) => (val ?? 0).toLocaleString(),
  colors = { unique: 'green', duplicates: 'orange', total: 'blue' },
  onBubbleClick,
}: HealthBarProps) => {
  const uniquePercent = total > 0 ? (unique / total) * 100 : 0;
  const duplicatePercent = total > 0 ? (duplicates / total) * 100 : 0;

  const colorClass = (c: string) => {
    if (c === 'green') return 'bg-green-500';
    if (c === 'blue') return 'bg-blue-500';
    if (c === 'orange') return 'bg-orange-500';
    return 'bg-gray-500';
  };
  const bubbleClass = (c: string) => {
    if (c === 'blue') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (c === 'green') return 'bg-green-50 text-green-700 border-green-100';
    if (c === 'orange') return 'bg-orange-50 text-orange-700 border-orange-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      <div className="flex justify-between items-end mb-3 anim-fade-in-up--stagger-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colorClass(colors.unique ?? 'gray')}`} />
            <span className="text-gray-700">
              {labels.unique} ({uniquePercent.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colorClass(colors.duplicates ?? 'gray')}`} />
            <span className="text-gray-700">
              {labels.duplicates} ({duplicatePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="h-4 w-full bg-gray-100 rounded-full flex mb-4 overflow-hidden anim-fade-in-up--stagger-2">
        <div
          style={{ width: `${uniquePercent}%` }}
          className="h-full overflow-hidden cursor-pointer group"
          onClick={() => onBubbleClick?.('unique')}
          role="progressbar"
          aria-valuenow={uniquePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full w-full anim-bar-fill anim-bar-fill--delay-1 relative ${colorClass(colors.unique ?? 'gray')}`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div
          style={{ width: `${duplicatePercent}%` }}
          className="h-full overflow-hidden cursor-pointer"
          onClick={() => onBubbleClick?.('duplicates')}
          role="progressbar"
          aria-valuenow={duplicatePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full w-full anim-bar-fill anim-bar-fill--delay-2 ${colorClass(colors.duplicates ?? 'gray')}`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 anim-fade-in-up--stagger-3">
        {[
          { label: labels.total, value: total, color: colors.total, type: 'total' as const },
          { label: labels.unique, value: unique, color: colors.unique, type: 'unique' as const },
          {
            label: labels.duplicates,
            value: duplicates,
            color: colors.duplicates,
            type: 'duplicates' as const,
          },
        ].map((item) => (
          <span
            key={item.label}
            onClick={() => onBubbleClick?.(item.type)}
            className={`ui-hover-pill px-3 py-1 text-xs font-medium rounded-full border cursor-pointer shadow-sm ${bubbleClass(item.color ?? 'gray')}`}
          >
            {item.label}: {formatter(item.value)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default memo(HealthBar);
