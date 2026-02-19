interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-forest-100 ${className}`}
      aria-hidden="true"
    />
  )
}
