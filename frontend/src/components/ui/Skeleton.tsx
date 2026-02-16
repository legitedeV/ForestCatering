interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`animate-pulse rounded-xl bg-fc-surface/80 ${className}`} aria-hidden="true" />;
};
