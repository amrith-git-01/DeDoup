import React, { useState, useMemo, memo } from 'react';
import type { FileAnalyticsProps } from '../../types/metrics';
import { formatBytes } from '../../utils/format';
import { Dropdown } from '../ui/Dropdown';
import { ViewModeContainer, type ViewModeContainerItem } from './ViewModeContainer';
import type { ViewMode } from '../../types/ui';
import type { MetricItem, MetricMode } from '../../types/metrics';

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
  '#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899',
  '#06b6d4', '#f59e0b', '#84cc16', '#14b8a6', '#6366f1',
];

const FileAnalytics: React.FC<FileAnalyticsProps> = ({
  fileMetrics,
  onCategoryClick,
  onExtensionClick,
  onShowAll,
}) => {
  const [mode, setMode] = useState<MetricMode>('categories');
  const [view, setView] = useState<ViewMode>('list');

  const categoryData: MetricItem[] = useMemo(() => {
    const predefined = ['document', 'image', 'video', 'audio', 'archive', 'code', 'executable', 'other'];
    const metrics = fileMetrics?.categories || [];
    const dataMap = new Map(metrics.map((m) => [m.name.toLowerCase(), m]));
    const allNames = Array.from(new Set([...predefined, ...metrics.map((m) => m.name.toLowerCase())]));
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
      .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.name.localeCompare(b.name)));
  }, [fileMetrics?.categories]);

  const extensionData: MetricItem[] = useMemo(() => {
    return (fileMetrics?.extensions || [])
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
      .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.name.localeCompare(b.name)));
  }, [fileMetrics?.extensions]);

  const activeData = mode === 'categories' ? categoryData : extensionData;
  const totalCount = activeData.reduce((sum, c) => sum + c.value, 0);
  const totalSize = activeData.reduce((sum, c) => sum + c.size, 0);
  const totalNewCount = activeData.reduce((sum, c) => sum + c.newValue, 0);
  const totalDuplicateCount = activeData.reduce((sum, c) => sum + c.duplicateValue, 0);

  const containerData: ViewModeContainerItem[] = useMemo(
    () =>
      activeData
        .slice()
        .sort((a, b) => b.size - a.size)
        .map((item) => ({
          name: item.name,
          value: item.value,
          secondary: item.size,
          fill: item.fill,
          newValue: item.newValue,
          duplicateValue: item.duplicateValue,
        })),
    [activeData]
  );
  const totalRow: ViewModeContainerItem = {
    name: 'Total',
    value: totalCount,
    secondary: totalSize,
    fill: '#6b7280',
    newValue: totalNewCount,
    duplicateValue: totalDuplicateCount,
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-900">File Analytics</h3>
      </div>
      <ViewModeContainer
        view={view}
        onViewChange={setView}
        data={containerData}
        title=""
        valueLabel="Files"
        secondaryLabel="Size"
        formatValue={(n) => n.toLocaleString()}
        formatSecondary={formatBytes}
        totalRow={totalRow}
        onTotalClick={onShowAll}
        headerLeft={
          <>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Metric Type</span>
            <Dropdown
              value={mode}
              onChange={(v) => setMode(v as MetricMode)}
              options={[
                { value: 'categories', label: 'File Categories' },
                { value: 'extensions', label: 'File Extensions' },
              ]}
              size="md"
            />
          </>
        }
        onItemClick={(item) => (mode === 'categories' ? onCategoryClick(item.name) : onExtensionClick(item.name))}
        onChartClick={(item) => {
          if (item.name === 'Total') onShowAll();
          else if (mode === 'categories') onCategoryClick(item.name);
          else onExtensionClick(item.name);
        }}
        emptyMessage={view === 'list' ? 'No data available' : 'No activity yet. Start downloading to see trends here.'}
        colors={mode === 'categories' ? Object.values(CATEGORY_COLORS) : EXTENSION_COLORS}
        minHeight="420px"
      />
    </div>
  );
};

export default memo(FileAnalytics);
