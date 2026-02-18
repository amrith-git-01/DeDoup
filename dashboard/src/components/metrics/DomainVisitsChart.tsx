import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TodayByDomainItem } from '../../types/browsing';

interface DomainVisitsChartProps {
  data: TodayByDomainItem[];
}

const MAX_DOMAINS = 10;

function DomainVisitsChart({ data }: DomainVisitsChartProps) {
  const chartData = data.slice(0, MAX_DOMAINS).map((item) => ({
    domain: item.domain.length > 20 ? item.domain.slice(0, 17) + '...' : item.domain,
    fullDomain: item.domain,
    visitCount: item.visitCount ?? 0,
  }));

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-sm text-gray-500">
        No browsing today yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Visits by domain (today)
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Number of visits per site</p>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="domain"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              interval={0}
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
                      title={row.fullDomain}
                    >
                      {row.fullDomain}
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Visits</span>
                      <span className="font-semibold font-tabular-nums">{row.visitCount}</span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              offset={15}
            />
            <Bar
              dataKey="visitCount"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={28}
              activeBar={{ fill: '#2563eb' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(DomainVisitsChart);
