import React, { useState, memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import type { FileAnalyticsProps } from '../../types/metrics';
import { formatBytes } from '../../utils/format';
import { Dropdown } from '../ui/Dropdown';
import { getFileCategoryMeta } from '../../utils/fileCategory';
import { ViewModeToggle } from '../ui/ViewModeToggle';
import type { ViewMode } from '../../types/ui';
import { ChartMetricTooltip } from '../ui/ChartMetricTooltip';

import type { MetricItem, MetricMode } from '../../types/metrics';

// Colors for chart bars/slices
const CATEGORY_COLORS: Record<string, string> = {
  document: '#3b82f6',
  image: '#10b981',
  video: '#8b5cf6',
  audio: '#ec4899',
  archive: '#f97316',
  code: '#06b6d4',
  executable: '#ef4444',
  other: '#6b7280',
};

const EXTENSION_COLORS = [
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

const FileAnalytics: React.FC<FileAnalyticsProps> = ({
  fileMetrics,
  onCategoryClick,
  onExtensionClick,
  onShowAll,
}) => {
  const [mode, setMode] = useState<MetricMode>('categories'); // dropdown
  const [view, setView] = useState<ViewMode>('list'); // list / pie / bar

  // Build category data
  const categoryData: MetricItem[] = (() => {
    const predefined = [
      'document',
      'image',
      'video',
      'audio',
      'archive',
      'code',
      'executable',
      'other',
    ];
    const metrics = fileMetrics?.categories || [];

    const dataMap = new Map(metrics.map((m) => [m.name.toLowerCase(), m]));
    const allNames = Array.from(
      new Set([...predefined, ...metrics.map((m) => m.name.toLowerCase())]),
    );

    return allNames
      .map((raw) => {
        const metric = dataMap.get(raw);
        const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
        return {
          rawName: raw,
          name: displayName,
          value: metric?.count || 0,
          size: metric?.size || 0,
          newValue: metric?.newCount || 0,
          duplicateValue: metric?.duplicateCount || 0,
          fill: CATEGORY_COLORS[raw] || '#6b7280',
        };
      })
      .filter((item) => item.value > 0 || predefined.includes(item.rawName))
      .sort((a, b) => {
        if (b.value !== a.value) return b.value - a.value;
        return a.name.localeCompare(b.name);
      });
  })();

  // Build extension data
  const extensionData: MetricItem[] = (fileMetrics?.extensions || [])
    .map((m, idx) => {
      const raw = m.name.toLowerCase();
      const label = m.name.startsWith('.') ? m.name.toUpperCase() : `.${m.name.toUpperCase()}`;
      return {
        rawName: raw,
        name: label,
        value: m.count,
        size: m.size,
        newValue: m.newCount ?? 0,
        duplicateValue: m.duplicateCount ?? 0,
        fill: EXTENSION_COLORS[idx % EXTENSION_COLORS.length],
      };
    })
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return a.name.localeCompare(b.name);
    });

  // Active dataset based on dropdown mode
  const activeData = mode === 'categories' ? categoryData : extensionData;
  const totalCount =
    mode === 'categories'
      ? categoryData.reduce((sum, c) => sum + c.value, 0)
      : extensionData.reduce((sum, c) => sum + c.value, 0);
  const totalSize =
    mode === 'categories'
      ? categoryData.reduce((sum, c) => sum + c.size, 0)
      : extensionData.reduce((sum, c) => sum + c.size, 0);

  const totalNewCount =
    mode === 'categories'
      ? categoryData.reduce((sum, c) => sum + c.newValue, 0)
      : extensionData.reduce((sum, c) => sum + c.newValue, 0);
  const totalDuplicateCount =
    mode === 'categories'
      ? categoryData.reduce((sum, c) => sum + c.duplicateValue, 0)
      : extensionData.reduce((sum, c) => sum + c.duplicateValue, 0);

  const hasData = activeData.length > 0;

  const handleItemClick = (item: MetricItem) => {
    if (mode === 'categories') {
      onCategoryClick(item.name);
    } else {
      onExtensionClick(item.name);
    }
  };

  const handleChartClick = (data: any) => {
    if (!data || !data.name) return;
    if (data.name === 'Total') {
      onShowAll();
      return;
    }
    if (mode === 'categories') {
      onCategoryClick(data.name);
    } else {
      onExtensionClick(data.name);
    }
  };

  // Data for bar chart (prepend Total)
  const barChartData = [
    {
      name: 'Total',
      value: totalCount,
      fill: '#6b7280',
      newValue: totalNewCount,
      duplicateValue: totalDuplicateCount,
      size: totalSize,
    },
    ...activeData,
  ];

  const selectedLabel = mode === 'categories' ? 'File Categories' : 'File Extensions';

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-900">File Analytics</h3>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col min-h-[420px]">
        {/* Header: dropdown + view toggles */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Metric Type
            </span>
            <Dropdown
              value={mode}
              onChange={(value) => setMode(value as MetricMode)}
              options={[
                { value: 'categories', label: 'File Categories' },
                { value: 'extensions', label: 'File Extensions' },
              ]}
              size="md"
            />
          </div>

          <ViewModeToggle value={view} onChange={(mode) => setView(mode)} />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col">
          {!hasData ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
              {view === 'list'
                ? 'No data available'
                : 'No activity yet. Start downloading to see trends here.'}
            </div>
          ) : (
            <>
              {view === 'list' && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Total Row */}
                  <div
                    onClick={onShowAll}
                    className="ui-hover-row cursor-pointer rounded-lg py-1 -mx-1 px-1"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Total</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {totalCount.toLocaleString()} files
                          {` (`}
                          {totalNewCount.toLocaleString()} new,{' '}
                          {totalDuplicateCount.toLocaleString()} dup
                          {`)`}
                        </span>
                        <span className="text-xs font-bold text-gray-900 min-w-[60px] text-right">
                          {formatBytes(totalSize)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full w-full anim-bar-fill anim-bar-fill--fast bg-gray-400"
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                  </div>

                  {/* Rows */}
                  {activeData
                    .slice()
                    .sort((a, b) => b.size - a.size)
                    .map((item) => {
                      const percentage = totalSize > 0 ? (item.size / totalSize) * 100 : 0;
                      const isCategories = mode === 'categories';
                      const iconMeta = isCategories ? getFileCategoryMeta(item.rawName) : null;

                      return (
                        <div
                          key={item.name}
                          onClick={() => handleItemClick(item)}
                          className="ui-hover-row cursor-pointer rounded-lg py-1 -mx-1 px-1"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              {iconMeta && (
                                <iconMeta.Icon
                                  className={`w-3.5 h-3.5 opacity-80 ${iconMeta.colorClass}`}
                                />
                              )}
                              <span className="text-xs font-medium text-gray-700">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {item.value.toLocaleString()} files
                                {` (`}
                                {item.newValue.toLocaleString()} new,{' '}
                                {item.duplicateValue.toLocaleString()} dup
                                {`)`}
                              </span>
                              <span className="text-xs font-bold text-gray-900 min-w-[60px] text-right">
                                {formatBytes(item.size)}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full overflow-hidden"
                              style={{ width: `${percentage}%` }}
                            >
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
              )}

              {view === 'pie' && (
                <div className="flex-1 h-full min-h-[260px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={activeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) =>
                          (percent ?? 0) > 0.05
                            ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            : ''
                        }
                        labelLine={false}
                        onClick={(data) => data && handleChartClick(data)}
                        cursor="pointer"
                      >
                        {activeData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={(props) => {
                          if (!props.active || !props.payload?.length) return null;
                          const item = props.payload[0]?.payload as MetricItem | undefined;
                          if (!item) return null;
                          return (
                            <ChartMetricTooltip
                              title={item.name}
                              total={item.value}
                              newCount={item.newValue}
                              duplicateCount={item.duplicateValue}
                              size={formatBytes(item.size)}
                            />
                          );
                        }}
                        wrapperStyle={{ zIndex: 9999 }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        offset={15}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {view === 'bar' && (
                <div className="flex-1 h-full min-h-[260px] mt-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={barChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip
                        content={(props) => {
                          if (!props.active || !props.payload?.length) return null;
                          const item = props.payload[0]?.payload as
                            | (MetricItem & {
                                name: string;
                                value: number;
                                fill: string;
                                size?: number;
                              })
                            | undefined;
                          if (!item) return null;
                          const total = item.value;
                          const newCount = item.newValue ?? 0;
                          const duplicateCount = item.duplicateValue ?? 0;
                          const sizeStr =
                            item.size != null ? formatBytes(item.size) : formatBytes(totalSize);
                          return (
                            <ChartMetricTooltip
                              title={item.name}
                              total={total}
                              newCount={newCount}
                              duplicateCount={duplicateCount}
                              size={sizeStr}
                            />
                          );
                        }}
                        wrapperStyle={{ zIndex: 9999 }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        offset={15}
                      />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        barSize={24}
                        onClick={(data) => handleChartClick(data)}
                        cursor="pointer"
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(FileAnalytics);
