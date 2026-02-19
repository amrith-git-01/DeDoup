import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../../utils/format';
import type { TopSiteItem } from '../../types/browsing';

interface TopSitesChartProps {
  topSites: TopSiteItem[];
}

const MAX_SITES = 10;

function TopSitesChart({ topSites }: TopSitesChartProps) {
  const data = topSites.slice(0, MAX_SITES).map((item) => ({
    domain: item.domain.length > 24 ? item.domain.slice(0, 21) + '...' : item.domain,
    fullDomain: item.domain,
    totalSeconds: item.totalSeconds,
    visitCount: item.visitCount,
  }));

  if (!data.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-sm text-gray-500">
        No top sites data yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">Top sites by time</h3>
      </div>
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 2, right: 20, bottom: 2, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v / 60)}m`}
            />
            <YAxis
              type="category"
              dataKey="domain"
              width={120}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload?.length) return null;
                const row = props.payload[0]?.payload as (typeof data)[0];
                if (!row) return null;
                return (
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-xs text-gray-900 min-w-[160px]">
                    <div
                      className="font-semibold mb-1.5 border-b border-gray-200 pb-1.5 truncate"
                      title={row.fullDomain}
                    >
                      {row.fullDomain}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Time</span>
                        <span className="font-semibold font-tabular-nums">
                          {formatDuration(row.totalSeconds)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Visits</span>
                        <span className="font-semibold font-tabular-nums">{row.visitCount}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              offset={15}
            />
            <Bar
              dataKey="totalSeconds"
              fill="#93c5fd"
              radius={[0, 4, 4, 0]}
              barSize={18}
              activeBar={{ fill: '#60a5fa' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(TopSitesChart);
