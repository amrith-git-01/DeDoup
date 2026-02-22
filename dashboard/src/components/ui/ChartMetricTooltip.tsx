import type { ChartMetricTooltipProps } from '../../types/ui';

export function ChartMetricTooltip({
  title,
  total,
  newCount,
  duplicateCount,
  size,
}: ChartMetricTooltipProps) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-xs text-gray-900 min-w-[150px]">
      <div className="font-semibold mb-1.5 border-b border-gray-200 pb-1.5 text-gray-900">
        {title}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-blue-600">Total</span>
          <span className="font-semibold font-tabular-nums text-gray-900">
            {total.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-green-600">New</span>
          <span className="font-semibold font-tabular-nums text-gray-900">
            {newCount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-orange-600">Duplicates</span>
          <span className="font-semibold font-tabular-nums text-gray-900">
            {duplicateCount.toLocaleString()}
          </span>
        </div>
        {size != null && size !== '' && (
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
            <span className="text-gray-500">Size</span>
            <span className="font-semibold font-tabular-nums text-gray-900">{size}</span>
          </div>
        )}
      </div>
    </div>
  );
}
