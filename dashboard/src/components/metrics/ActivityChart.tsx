import { useState, memo, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DailyActivity } from '../../types/metrics';
import { Dropdown } from '../ui/Dropdown';
import { ChartMetricTooltip } from '../ui/ChartMetricTooltip';
import type { ActivityChartProps } from '../../types/metrics';

type Period = 7 | 15 | 30;

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityChart = ({ dailyActivity, onDateClick }: ActivityChartProps) => {
  const [period, setPeriod] = useState<Period>(7);

  if (!dailyActivity.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center h-full text-sm text-gray-500">
        No activity yet. Start downloading to see trends here.
      </div>
    );
  }

  // Build chart data: generate N days ending with today, filling gaps with zeros
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityMap = new Map<string, DailyActivity>();
    dailyActivity.forEach((item) => {
      activityMap.set(item.date, item);
    });

    const data: DailyActivity[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      data.push(
        activityMap.get(dateStr) ?? {
          date: dateStr,
          total: 0,
          unique: 0,
          duplicate: 0,
        },
      );
    }

    return data;
  }, [dailyActivity, period]);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
      {/* Header with dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">Download Activity</h3>

        <Dropdown
          value={String(period)}
          onChange={(value) => setPeriod(Number(value) as Period)}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '15', label: 'Last 15 days' },
            { value: '30', label: 'Last 30 days' },
          ]}
          size="md"
        />
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: -15 }}
            onClick={(e) => {
              if (e?.activeLabel) onDateClick?.(String(e.activeLabel));
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
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
                const data = props.payload[0]?.payload as DailyActivity | undefined;
                if (!data) return null;
                const title = props.label
                  ? new Date(props.label).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';
                return (
                  <ChartMetricTooltip
                    title={title}
                    total={data.total}
                    newCount={data.unique}
                    duplicateCount={data.duplicate}
                  />
                );
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              offset={15}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            {/* Custom legend for controlled order */}
            <Legend
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
              content={() => (
                <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#93c5fd] inline-block" />
                    Total
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
                    New
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" />
                    Duplicates
                  </span>
                </div>
              )}
            />
            <Bar
              dataKey="total"
              name="Total"
              fill="#93c5fd"
              radius={[4, 4, 0, 0]}
              barSize={period <= 7 ? 24 : period <= 15 ? 16 : 10}
              cursor="pointer"
              activeBar={{ fill: '#60a5fa' }}
            />
            <Line
              dataKey="unique"
              name="New"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              type="monotone"
            />
            <Line
              dataKey="duplicate"
              name="Duplicates"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(ActivityChart);
