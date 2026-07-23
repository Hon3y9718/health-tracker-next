// Rule (CLAUDE.md #4): status colors here reuse the same bands the daily_totals view
// already computed (calorie_status / protein_status / water_status) -- this file only
// picks a color for a status string, it never re-derives the threshold itself.
//
// Static server-rendered SVG, same simplification as WeightChart: no hover/tooltip layer
// yet. Bars are capped at 24px, 4px rounded data-end per the dataviz mark spec, one hue
// per status (never a rainbow), with a dashed target reference line.
type CalorieStatus = "under" | "on_target" | "over" | "way_over";
type LevelStatus = "hit" | "close" | "low";

function statusColor(kind: "calorie" | "level", status: string | null): string {
  if (status === null) return "var(--ink-muted)";
  if (kind === "calorie") {
    switch (status as CalorieStatus) {
      case "under":
        return "var(--status-neutral-fg)";
      case "on_target":
        return "var(--status-good)";
      case "over":
        return "var(--status-serious)";
      case "way_over":
        return "var(--status-critical)";
    }
  }
  switch (status as LevelStatus) {
    case "hit":
      return "var(--status-good)";
    case "close":
      return "var(--status-warning)";
    case "low":
      return "var(--status-serious)";
  }
  return "var(--ink-muted)";
}

export type DailyBarChartRow = {
  log_date: string;
  value: number | null;
  status: string | null;
};

export function DailyBarChart({
  title,
  unit,
  target,
  rows,
  statusKind,
}: {
  title: string;
  unit: string;
  target: number | null;
  rows: DailyBarChartRow[];
  statusKind: "calorie" | "level";
}) {
  const sorted = [...rows].sort((a, b) => a.log_date.localeCompare(b.log_date));

  if (sorted.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <p className="text-sm text-[var(--ink-muted)]">No days logged yet.</p>
      </div>
    );
  }

  const width = 320;
  const height = 140;
  const padding = { top: 8, right: 8, bottom: 18, left: 8 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = sorted.map((r) => r.value ?? 0);
  const maxValue = Math.max(...values, target ?? 0) * 1.1 || 1;

  const barSlot = innerWidth / sorted.length;
  const barWidth = Math.min(24, barSlot - 2);

  const y = (value: number) => padding.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">
        {title} <span className="text-[var(--ink-muted)] font-normal">({unit})</span>
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${title} over the last ${sorted.length} days, target ${target ?? "unset"} ${unit}`}
      >
        {target !== null && target > 0 && (
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(target)}
            y2={y(target)}
            stroke="var(--ink-muted)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {sorted.map((row, i) => {
          const value = row.value ?? 0;
          const barHeight = (value / maxValue) * innerHeight;
          const x = padding.left + i * barSlot + (barSlot - barWidth) / 2;
          return (
            <rect
              key={row.log_date}
              x={x}
              y={padding.top + innerHeight - barHeight}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={4}
              fill={statusColor(statusKind, row.status)}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-[var(--ink-muted)] mt-1">
        <span>{formatShortDate(sorted[0].log_date)}</span>
        <span>{formatShortDate(sorted[sorted.length - 1].log_date)}</span>
      </div>
    </div>
  );
}

function formatShortDate(logDate: string): string {
  const [, month, day] = logDate.split("-");
  return `${month}/${day}`;
}
