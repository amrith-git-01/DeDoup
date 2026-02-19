import { Skeleton } from './Skeleton';

const TimeInsightsSkeleton = () => {
  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <Skeleton className="h-5 w-32 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:h-[400px]">
        {/* ---------- ACTIVITY CHART (2 cols) ---------- */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
            {/* Chart header: title + period dropdown */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            {/* Chart body */}
            <div className="flex-1 min-h-0">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* ---------- RECENT DOWNLOADS (1 col) ---------- */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-10" />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg border border-transparent"
              >
                <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-5 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeInsightsSkeleton;
