import React, { useState, useMemo, memo } from 'react';
import { formatBytes } from '../../utils/format';
import { ViewModeContainer, type ViewModeContainerItem } from './ViewModeContainer';
import type { ViewMode } from '../../types/ui';
import type { SourceAnalyticsProps } from '../../types/metrics';

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

const SourceAnalytics: React.FC<SourceAnalyticsProps> = ({
  sourceStats,
  onSourceClick,
  onShowAll,
  onSourceOthersClick,
}) => {
  const [view, setView] = useState<ViewMode>('list');
  const sources = sourceStats?.sources ?? [];

  const containerData: ViewModeContainerItem[] = useMemo(
    () =>
      sources
        .slice()
        .sort((a, b) => b.totalSize - a.totalSize)
        .map((s, idx) => ({
          name: s.domain,
          value: s.totalDownloads,
          secondary: s.totalSize,
          fill: SOURCE_COLORS[idx % SOURCE_COLORS.length],
          newValue: s.newDownloads,
          duplicateValue: s.duplicateDownloads,
        })),
    [sources],
  );
  const totalDownloads = sources.reduce((sum, s) => sum + s.totalDownloads, 0);
  const totalSize = sources.reduce((sum, s) => sum + s.totalSize, 0);
  const totalNewDownloads = sources.reduce((sum, s) => sum + s.newDownloads, 0);
  const totalDuplicateDownloads = sources.reduce((sum, s) => sum + s.duplicateDownloads, 0);
  const totalRow: ViewModeContainerItem = {
    name: 'Total',
    value: totalDownloads,
    secondary: totalSize,
    fill: '#6b7280',
    newValue: totalNewDownloads,
    duplicateValue: totalDuplicateDownloads,
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-900">Download Sources</h3>
      </div>
      <ViewModeContainer
        view={view}
        onViewChange={setView}
        data={containerData}
        title="Domains"
        valueLabel="Downloads"
        secondaryLabel="Size"
        formatValue={(n) => n.toLocaleString()}
        formatSecondary={formatBytes}
        totalRow={totalRow}
        onTotalClick={onShowAll}
        onItemClick={(item) => {
          if (item.name === 'Others' && item.othersExcludedKeys?.length) {
            onSourceOthersClick?.(item.othersExcludedKeys);
          } else {
            onSourceClick?.(item.name);
          }
        }}
        onChartClick={(item) => {
          if (item.name === 'Total') onShowAll?.();
          else if (item.name === 'Others' && item.othersExcludedKeys?.length)
            onSourceOthersClick?.(item.othersExcludedKeys);
          else onSourceClick?.(item.name);
        }}
        colors={SOURCE_COLORS}
        topN={7}
        barXAxisReduceLabels
        emptyMessage={
          view === 'list'
            ? 'No data available'
            : 'No activity yet. Start downloading to see trends here.'
        }
        minHeight="420px"
      />
    </div>
  );
};

export default memo(SourceAnalytics);
