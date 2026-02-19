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
import { formatBytes } from '../../utils/format';
import { ViewModeToggle } from '../ui/ViewModeToggle';
import type { ViewMode } from '../../types/ui';
import { ChartMetricTooltip } from '../ui/ChartMetricTooltip';

import type { MetricItem, SourceAnalyticsProps } from '../../types/metrics';

const SOURCE_COLORS = [
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

const SourceAnalytics: React.FC<SourceAnalyticsProps> = ({ sourceStats }) => {
  const [view, setView] = useState<ViewMode>('list');

  const sources = sourceStats?.sources ?? [];

  const metricData: MetricItem[] = sources.map((s, idx) => ({
    rawName: s.domain,
    name: s.domain,
    value: s.totalDownloads,
    size: s.totalSize,
    fill: SOURCE_COLORS[idx % SOURCE_COLORS.length],
    newValue: s.newDownloads,
    duplicateValue: s.duplicateDownloads,
  }));

  const totalDownloads = metricData.reduce((sum, d) => sum + d.value, 0);
  const totalSize = metricData.reduce((sum, d) => sum + d.size, 0);
  const totalNewDownloads = sources.reduce((sum, s) => sum + s.newDownloads, 0);
  const totalDuplicateDownloads = sources.reduce((sum, s) => sum + s.duplicateDownloads, 0);

  const hasData = metricData.length > 0;

  const barChartData = [
    {
      name: 'Total',
      value: totalDownloads,
      fill: '#6b7280',
      newValue: totalNewDownloads,
      duplicateValue: totalDuplicateDownloads,
      size: totalSize,
    },
    ...metricData,
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-900">Download Sources</h3>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col min-h-[420px]">
        {/* Header: view toggles */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Domains
          </span>

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
              {/* LIST VIEW */}
              {view === 'list' && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Total row */}
                  <div className="ui-hover-row cursor-default rounded-lg py-1 -mx-1 px-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Total</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {totalDownloads.toLocaleString()} downloads
                          {` (`}
                          {totalNewDownloads.toLocaleString()} new,{' '}
                          {totalDuplicateDownloads.toLocaleString()} dup
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

                  {/* Domain rows */}
                  {sources
                    .slice()
                    .sort((a, b) => b.totalSize - a.totalSize)
                    .map((s, idx) => {
                      const color = SOURCE_COLORS[idx % SOURCE_COLORS.length];
                      const percentage = totalSize > 0 ? (s.totalSize / totalSize) * 100 : 0;

                      return (
                        <div
                          key={s.domain}
                          className="ui-hover-row cursor-default rounded-lg py-1 -mx-1 px-1"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-sm"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-medium text-gray-700">{s.domain}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="text-gray-500">
                                {s.totalDownloads.toLocaleString()} downloads
                                {` (`}
                                {s.newDownloads.toLocaleString()} new,{' '}
                                {s.duplicateDownloads.toLocaleString()} dup
                                {`)`}
                              </span>
                              <span className="text-xs font-bold text-gray-900 min-w-[60px] text-right">
                                {formatBytes(s.totalSize)}
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
                                style={{ transformOrigin: 'left', backgroundColor: color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* PIE VIEW */}
              {view === 'pie' && (
                <div className="flex-1 h-full min-h-[260px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={metricData}
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
                      >
                        {metricData.map((entry, _index) => (
                          <Cell key={entry.rawName} fill={entry.fill} />
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

              {/* BAR VIEW */}
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
                          const item = props.payload[0]?.payload as MetricItem | undefined;
                          if (!item) return null;
                          return (
                            <ChartMetricTooltip
                              title={item.name}
                              total={item.value}
                              newCount={item.newValue}
                              duplicateCount={item.duplicateValue}
                              size={
                                item.size != null ? formatBytes(item.size) : formatBytes(totalSize)
                              }
                            />
                          );
                        }}
                        wrapperStyle={{ zIndex: 9999 }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        offset={15}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24} cursor="pointer">
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

export default memo(SourceAnalytics);
