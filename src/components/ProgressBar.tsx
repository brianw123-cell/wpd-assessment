export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
          Question {current} of {total}
        </span>
        <span className="text-xs font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>
          {pct}%
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
        style={{ background: "var(--border-soft)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}
