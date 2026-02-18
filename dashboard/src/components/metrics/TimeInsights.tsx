import { memo } from 'react';

import { formatBytes, formatTimeAgo } from '../../utils/format';
import ActivityChart from './ActivityChart';

import type { TimeInsightsProps } from '../../types/metrics';
import { getFileCategoryMeta } from '../../utils/fileCategory';

/* ---------- Component ---------- */

const TimeInsights = ({
  trends,
  dailyActivity,
  habits,
  recentDownloads,
  onDateClick,
  onViewAllClick,
  onFileClick,
}: TimeInsightsProps) => {
  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-900">Download Activity</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:h-[400px]">
        {/* ---------- ACTIVITY CHART (2 cols) ---------- */}
        <div className="lg:col-span-2">
          <ActivityChart dailyActivity={dailyActivity} onDateClick={onDateClick} />
        </div>

        {/* ---------- RECENT DOWNLOADS (1 col) ---------- */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Recent Downloads</h3>
            <button
              onClick={onViewAllClick}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              View
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {recentDownloads.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No activity yet. Start downloading to see recent files here.
              </div>
            ) : (
              recentDownloads.map((file) => {
                const { Icon, colorClass } = getFileCategoryMeta(file.fileCategory || 'other');

                return (
                  <div
                    key={file.id}
                    onClick={() => onFileClick?.(file.id)}
                    className="ui-hover-row flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                      <p className="text-[10px] text-gray-400">
                        {formatBytes(file.size)} • {formatTimeAgo(file.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        file.status === 'duplicate'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {file.status === 'duplicate' ? 'DUP' : 'NEW'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TimeInsights);
