import type { WeightProgress } from "@/lib/queries/totals";

// Rule (CLAUDE.md #6): the rolling 7-day average is the primary line (accent hue, 2px);
// raw daily readings are secondary (muted, small dots) -- raw weight swings 1-2kg on water
// alone, so charting it as the headline reads as noise. This is a static server-rendered
// SVG: no hover/tooltip layer yet (a reasonable v1 simplification, not a design choice --
// revisit with the dataviz skill's interaction layer if this chart gets more use).
export function WeightChart({ data }: { data: WeightProgress[] }) {
  const points = [...data]
    .filter((d) => d.log_date && d.weight_kg !== null)
    .sort((a, b) => a.log_date!.localeCompare(b.log_date!));

  if (points.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        No weigh-ins logged yet.
      </p>
    );
  }

  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 24, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const times = points.map((p) => new Date(p.log_date!).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeSpan = maxTime - minTime || 1;

  const goalLow = points[points.length - 1].goal_weight_low_kg;
  const goalHigh = points[points.length - 1].goal_weight_high_kg;

  const weights = points.map((p) => p.weight_kg!);
  const rollingValues = points
    .map((p) => p.rolling_7d_avg)
    .filter((v): v is number => v !== null);
  const allValues = [...weights, ...rollingValues, goalLow ?? Infinity, goalHigh ?? -Infinity].filter(
    (v) => Number.isFinite(v),
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueSpan = maxValue - minValue || 1;
  const valuePadding = valueSpan * 0.1;

  const x = (time: number) => padding.left + ((time - minTime) / timeSpan) * innerWidth;
  const y = (value: number) =>
    padding.top +
    innerHeight -
    ((value - (minValue - valuePadding)) / (valueSpan + valuePadding * 2)) * innerHeight;

  const rollingPoints = points
    .filter((p) => p.rolling_7d_avg !== null)
    .map((p) => `${x(new Date(p.log_date!).getTime())},${y(p.rolling_7d_avg!)}`)
    .join(" ");

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = minValue - valuePadding + ((valueSpan + valuePadding * 2) * i) / yTicks;
    return Math.round(value * 10) / 10;
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Weight over time: rolling 7-day average and raw weigh-ins"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {tick}
            </text>
          </g>
        ))}

        {goalLow !== null && goalHigh !== null && (
          <rect
            x={padding.left}
            y={y(goalHigh)}
            width={innerWidth}
            height={Math.max(y(goalLow) - y(goalHigh), 0)}
            fill="var(--ink-muted)"
            opacity={0.1}
          />
        )}

        {points.map((p) => (
          <circle
            key={`raw-${p.log_date}`}
            cx={x(new Date(p.log_date!).getTime())}
            cy={y(p.weight_kg!)}
            r={4}
            fill="var(--ink-muted)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        ))}

        {rollingPoints && (
          <polyline
            points={rollingPoints}
            fill="none"
            stroke="var(--series-primary)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-[var(--ink-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 rounded-full bg-[var(--series-primary)]" />
          7-day average
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--ink-muted)]" />
          raw weigh-ins
        </span>
      </div>
    </div>
  );
}
