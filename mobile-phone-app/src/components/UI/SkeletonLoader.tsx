interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <article className={`rounded-2xl bg-white p-6 shadow-card dark:bg-gray-800 ${className}`} aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="mt-4 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    </article>
  );
}
