import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../../utils/format';
import type { TodayByDomainItem } from '../../types/browsing';

const PIE_COLORS = [
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

interface TodayByDomainPieChartProps {
  data: TodayByDomainItem[];
}

function TodayByDomainPieChart({ data }: TodayByDomainPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.domain,
    value: item.totalSeconds,
    totalSeconds: item.totalSeconds,
  }));

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-sm text-gray-500">
        No browsing today yet. Use the extension to see screen time by domain.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Screen Time</h3>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
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
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload?.length) return null;
                const item = props.payload[0]?.payload as { name: string; totalSeconds: number };
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
                      <span className="text-gray-600">Time</span>
                      <span className="font-semibold font-tabular-nums">
                        {formatDuration(item.totalSeconds)}
                      </span>
                    </div>
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
    </div>
  );
}

export default memo(TodayByDomainPieChart);
