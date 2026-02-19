import type { SkeletonProps } from '../../types/skeleton';

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200/80 ${className || ''}`} {...props} />
  );
};

export { Skeleton };
