import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ViewModeToggle } from '../ui/ViewModeToggle';
import type { ViewMode } from '../../types/ui';

const OTHERS_COLOR = '#9ca3af';

const DEFAULT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f97316',
  '#ec4899',
  '#06b6d4',
  '#f59e0b',
  '#84cc16',
  '#14b8a6',
  '#6366f1',
];

export interface ViewModeContainerItem {
  name: string;
  value: number;
  secondary?: number;
  fill?: string;
  newValue?: number;
  duplicateValue?: number;
  /** Domains that are in "Others" (rest after top N). Used for display. */
  othersKeys?: string[];
  /** Domains to exclude so the drawer shows only "Others" (top N names). Pass this to onSourceOthersClick. */
  othersExcludedKeys?: string[];
}

export interface ViewModeContainerProps {
  view: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  data: ViewModeContainerItem[];
  title: string;
  valueLabel: string;
  secondaryLabel?: string;
  formatValue: (n: number) => string;
  formatSecondary?: (n: number) => string;
  colors?: string[];
  barDataKey?: 'value' | 'secondary';
  emptyMessage?: string;
  className?: string;
  minHeight?: string;
  totalRow?: ViewModeContainerItem | null;
  onTotalClick?: () => void;
  headerLeft?: React.ReactNode;
  onItemClick?: (item: ViewModeContainerItem) => void;
  onChartClick?: (item: ViewModeContainerItem) => void;
  /** When set (e.g. 7), show only top N items + "Others". Only Source Analytics uses this. */
  topN?: number;
  /** When true, bar chart X-axis shows every Nth label to avoid overlap. Only Source Analytics uses this. */
  barXAxisReduceLabels?: boolean;
}

export const ViewModeContainer: React.FC<ViewModeContainerProps> = ({
  view,
  onViewChange,
  data,
  title,
  valueLabel,
  secondaryLabel,
  formatValue,
  formatSecondary = (n) => n.toLocaleString(),
  colors = DEFAULT_COLORS,
  barDataKey = 'value',
  emptyMessage = 'No data available',
  className = '',
  minHeight,
  totalRow,
  onTotalClick,
  headerLeft,
  onItemClick,
  onChartClick,
  topN,
  barXAxisReduceLabels,
}) => {
  const hasData = data.length > 0;
  const totalValue = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(260);

  useEffect(() => {
    const el = chartWrapperRef.current;
    if (!el) return;
    const setHeight = () => setChartHeight(el.offsetHeight);
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const chartData = useMemo(() => {
    const sorted = data
      .map((d, i) => ({
        ...d,
        fill: d.fill ?? colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    if (topN == null || topN <= 0 || sorted.length <= topN) return sorted;

    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const othersValue = rest.reduce((s, d) => s + d.value, 0);
    const othersSecondary = rest.reduce((s, d) => s + (d.secondary ?? 0), 0);
    const othersNew = rest.reduce((s, d) => s + (d.newValue ?? 0), 0);
    const othersDup = rest.reduce((s, d) => s + (d.duplicateValue ?? 0), 0);
    const topNames = top.map((d) => d.name);
    const restNames = rest.map((d) => d.name);
    const othersItem: ViewModeContainerItem = {
      name: 'Others',
      value: othersValue,
      secondary: othersSecondary > 0 ? othersSecondary : undefined,
      newValue: othersNew > 0 ? othersNew : undefined,
      duplicateValue: othersDup > 0 ? othersDup : undefined,
      fill: OTHERS_COLOR,
      othersKeys: restNames,
      othersExcludedKeys: topNames,
    };
    return [...top, othersItem];
  }, [data, colors, topN]);

  const listContent = (
    <div className="space-y-4 h-[300px] min-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {totalRow != null && (
        <div
          role={onTotalClick ? 'button' : undefined}
          onClick={onTotalClick}
          className={`rounded-lg py-1 -mx-1 px-1 ${onTotalClick ? 'ui-hover-row cursor-pointer' : 'ui-hover-row cursor-default'}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">{totalRow.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {formatValue(totalRow.value)} {valueLabel.toLowerCase()}
                {(totalRow.newValue != null || totalRow.duplicateValue != null) && (
                  <>
                    {' '}
                    ({totalRow.newValue?.toLocaleString() ?? 0} new,{' '}
                    {totalRow.duplicateValue?.toLocaleString() ?? 0} dup)
                  </>
                )}
              </span>
              {secondaryLabel != null && totalRow.secondary != null && (
                <span className="text-xs font-bold text-gray-900 min-w-[60px] text-right">
                  {formatSecondary(totalRow.secondary)}
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full w-full anim-bar-fill anim-bar-fill--fast bg-gray-400"
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </div>
      )}
      {chartData.map((item) => {
        const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        return (
          <div
            key={item.name}
            role={onItemClick ? 'button' : undefined}
            onClick={() => onItemClick?.(item)}
            className={`ui-hover-row rounded-lg py-1 -mx-1 px-1 ${onItemClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-medium text-gray-700 truncate max-w-[60%]"
                title={item.name}
              >
                {item.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {formatValue(item.value)} {valueLabel.toLowerCase()}
                  {(item.newValue != null || item.duplicateValue != null) && (
                    <>
                      {' '}
                      ({item.newValue?.toLocaleString() ?? 0} new,{' '}
                      {item.duplicateValue?.toLocaleString() ?? 0} dup)
                    </>
                  )}
                </span>
                {secondaryLabel != null && item.secondary != null && (
                  <span className="text-xs font-bold text-gray-900 min-w-[60px] text-right">
                    {formatSecondary(item.secondary)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full overflow-hidden" style={{ width: `${pct}%` }}>
                <div
                  className="h-full w-full anim-bar-fill anim-bar-fill--fast"
                  style={{ transformOrigin: 'left', backgroundColor: item.fill }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const pieContent = (
    <div ref={chartWrapperRef} className="flex-1 min-h-[260px]">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            stroke="none"
            label={({ name, percent }) =>
              (percent ?? 0) > 0.05 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
            cursor="pointer"
            onClick={(data) =>
              data &&
              onChartClick?.({
                name: data.name,
                value: data.value,
                secondary: data.secondary,
                fill: data.fill,
              })
            }
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={chartData[i].fill!} />
            ))}
          </Pie>
          <Tooltip
            content={(props) => {
              if (!props.active || !props.payload?.length) return null;
              const item = props.payload[0]?.payload as ViewModeContainerItem & { fill?: string };
              if (!item) return null;
              return (
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-xs text-gray-900 min-w-[160px]">
                  <div
                    className="font-semibold mb-1.5 border-b border-gray-200 pb-1.5 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">{valueLabel}</span>
                    <span className="font-semibold font-tabular-nums">
                      {formatValue(item.value)}
                    </span>
                  </div>
                  {secondaryLabel != null && item.secondary != null && (
                    <div className="flex justify-between gap-4 mt-1">
                      <span className="text-gray-600">{secondaryLabel}</span>
                      <span className="font-semibold font-tabular-nums">
                        {formatSecondary(item.secondary)}
                      </span>
                    </div>
                  )}
                  {(item.newValue != null || item.duplicateValue != null) && (
                    <>
                      <div className="flex justify-between gap-4 mt-1">
                        <span className="text-gray-600">New</span>
                        <span className="font-semibold font-tabular-nums">
                          {item.newValue?.toLocaleString() ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 mt-0.5">
                        <span className="text-gray-600">Duplicates</span>
                        <span className="font-semibold font-tabular-nums">
                          {item.duplicateValue?.toLocaleString() ?? 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            }}
            wrapperStyle={{ zIndex: 9999 }}
            allowEscapeViewBox={{ x: true, y: true }}
            offset={15}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const barChartData =
    totalRow != null
      ? [{ ...totalRow, fill: totalRow.fill ?? '#6b7280' }, ...chartData]
      : chartData;
  const barContent = (
    <div ref={chartWrapperRef} className="flex-1 min-h-[260px]">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={barChartData} margin={{ top: 5, right: 5, bottom: 20, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval={
              barXAxisReduceLabels && barChartData.length > 8
                ? Math.max(0, Math.floor(barChartData.length / 8))
                : 0
            }
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={(props) => {
              if (!props.active || !props.payload?.length) return null;
              const row = props.payload[0]?.payload as (typeof chartData)[0];
              if (!row) return null;
              return (
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-xs text-gray-900 min-w-[160px]">
                  <div
                    className="font-semibold mb-1.5 border-b border-gray-200 pb-1.5 truncate"
                    title={row.name}
                  >
                    {row.name}
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">{valueLabel}</span>
                    <span className="font-semibold font-tabular-nums">
                      {formatValue(row.value)}
                    </span>
                  </div>
                  {secondaryLabel != null && row.secondary != null && (
                    <div className="flex justify-between gap-4 mt-1">
                      <span className="text-gray-600">{secondaryLabel}</span>
                      <span className="font-semibold font-tabular-nums">
                        {formatSecondary(row.secondary)}
                      </span>
                    </div>
                  )}
                  {(row.newValue != null || row.duplicateValue != null) && (
                    <>
                      <div className="flex justify-between gap-4 mt-1">
                        <span className="text-gray-600">New</span>
                        <span className="font-semibold font-tabular-nums">
                          {row.newValue?.toLocaleString() ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 mt-0.5">
                        <span className="text-gray-600">Duplicates</span>
                        <span className="font-semibold font-tabular-nums">
                          {row.duplicateValue?.toLocaleString() ?? 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            offset={15}
          />
          <Bar
            dataKey={barDataKey}
            radius={[4, 4, 0, 0]}
            barSize={28}
            activeBar={{ fill: '#2563eb' }}
            cursor={onChartClick ? 'pointer' : undefined}
            onClick={(data: unknown) => {
              const row = data as ViewModeContainerItem & { fill?: string };
              if (row?.name != null) onChartClick?.(row);
            }}
          >
            {barChartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {headerLeft ?? (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {title}
            </span>
          )}
        </div>
        <ViewModeToggle value={view} onChange={onViewChange} />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
            {emptyMessage}
          </div>
        ) : (
          <>
            {view === 'list' && listContent}
            {view === 'pie' && pieContent}
            {view === 'bar' && barContent}
          </>
        )}
      </div>
    </div>
  );
};
