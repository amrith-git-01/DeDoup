import { Skeleton } from './Skeleton';

const FileAnalyticsSkeleton = () => {
  return (
    <div className="w-full mb-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <Skeleton className="h-5 w-32 rounded bg-gray-200" />
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col min-h-[420px]">
        {/* Header: metric type + dropdown + view toggles */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20 rounded" /> {/* "Metric Type" label */}
            <Skeleton className="h-8 w-32 rounded-lg" /> {/* Dropdown */}
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>

        {/* Body: mimic list view with total row + items */}
        <div className="flex-1 flex flex-col">
          {/* Total row */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" /> {/* "Total" label */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" /> {/* total files */}
                <Skeleton className="h-3 w-20" /> {/* total size */}
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          {/* Item rows */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-sm" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAnalyticsSkeleton;
