export function ProgressBar({ value, colorClass = "bg-duo-green" }: { value: number; colorClass?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-duo-gray">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
