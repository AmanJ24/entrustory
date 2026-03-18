/**
 * Skeleton — Reusable shimmer loading component.
 * Replaces spinner-only loading states with layout-aware placeholders.
 */

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

/** Pre-built skeleton for table rows */
export const TableRowSkeleton = ({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-slate-800/50">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <div className="animate-pulse bg-slate-800 rounded h-4 w-full" style={{ maxWidth: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/** Pre-built skeleton for metric cards */
export const MetricCardSkeleton = () => {
  return (
    <div className="bg-[#111722] border border-slate-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-24" />
          <div className="h-6 bg-slate-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
};
