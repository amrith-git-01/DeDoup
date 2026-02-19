import { Skeleton } from './Skeleton';

const DownloadListSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      {/* Icon */}
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Filename */}
        <Skeleton className="h-4 w-3/4 rounded" />

        {/* Metadata Row */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-14 rounded" /> {/* Size */}
          <Skeleton className="h-1 w-1 rounded-full" /> {/* Dot */}
          <Skeleton className="h-3 w-24 rounded" /> {/* Date */}
        </div>
      </div>

      {/* Status & Chevron Actions */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-md flex-shrink-0" /> {/* Status Badge */}
        <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" /> {/* Chevron */}
      </div>
    </div>
  );
};

export default DownloadListSkeleton;
