import { useState, useMemo, useRef, useEffect, memo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Dropdown } from '../ui/Dropdown';
import { formatDuration } from '../../utils/format';
import type { BrowsingDailyActivity } from '../../types/browsing';

type Period = 7 | 15 | 30;

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const toLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface BrowsingActivityChartProps {
  dailyActivity: BrowsingDailyActivity[];
}

function BrowsingActivityChart({ dailyActivity }: BrowsingActivityChartProps) {
  const [period, setPeriod] = useState<Period>(7);
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
  }, []);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityMap = new Map<string, BrowsingDailyActivity>();
    dailyActivity.forEach((item) => activityMap.set(item.date, item));

    const data: { date: string; totalSeconds: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = toLocalDateString(d);
      const item = activityMap.get(dateStr);
      data.push({
        date: dateStr,
        totalSeconds: item ? item.totalSeconds : 0,
      });
    }
    return data;
  }, [dailyActivity, period]);

  if (!dailyActivity.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-sm text-gray-500">
        No browsing activity yet. Use the extension to see screen time here.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Screen time over time
        </h3>
        <Dropdown
          value={String(period)}
          onChange={(v) => setPeriod(Number(v) as Period)}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '15', label: 'Last 15 days' },
            { value: '30', label: 'Last 30 days' },
          ]}
          size="md"
        />
      </div>
      <div ref={chartWrapperRef} className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
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
              tickFormatter={(v) => `${Math.round(v / 60)}m`}
            />
            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload?.length) return null;
                const row = props.payload[0]?.payload as { date: string; totalSeconds: number };
                if (!row) return null;
                const title = props.label
                  ? new Date(props.label).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';
                return (
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-xs text-gray-900 min-w-[140px]">
                    <div className="font-semibold mb-1.5 border-b border-gray-200 pb-1.5">
                      {title}
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Time</span>
                      <span className="font-semibold font-tabular-nums">
                        {formatDuration(row.totalSeconds)}
                      </span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              offset={15}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            <Bar
              dataKey="totalSeconds"
              name="Time"
              fill="#93c5fd"
              radius={[4, 4, 0, 0]}
              barSize={period <= 7 ? 24 : period <= 15 ? 16 : 10}
              cursor="pointer"
              activeBar={{ fill: '#60a5fa' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(BrowsingActivityChart);
