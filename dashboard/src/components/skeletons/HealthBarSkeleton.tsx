import { Skeleton } from './Skeleton';

const HealthBarSkeleton = () => {
  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Bar */}
      <Skeleton className="h-4 w-full rounded-full mb-4" />

      {/* Footer Bubbles */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
};

export default HealthBarSkeleton;
