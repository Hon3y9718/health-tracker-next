// The "how far am I" summary for the weight journey, reading straight from
// weight_progress.progress_pct/lost_kg/to_goal_kg -- no recomputation, per rule #4. Sits
// above the chart: the headline number first, "how I've been" trend below it.
export function WeightGoalProgress({
  progressPct,
  lostKg,
  toGoalKg,
}: {
  progressPct: number | null;
  lostKg: number | null;
  toGoalKg: number | null;
}) {
  if (progressPct === null) return null;
  const clamped = Math.max(0, Math.min(100, progressPct));

  return (
    <div className="rounded-lg border border-[var(--gridline)] p-4 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-[var(--ink-muted)]">Progress to goal</span>
        <span className="text-2xl font-semibold tabular-nums">{progressPct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--gridline)] overflow-hidden">
        <div
          className="h-2 rounded-full bg-[var(--series-primary)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--ink-muted)]">
        <span>{lostKg !== null ? `${lostKg.toFixed(1)}kg lost` : "—"}</span>
        <span>{toGoalKg !== null ? `${Math.abs(toGoalKg).toFixed(1)}kg to goal band` : "—"}</span>
      </div>
    </div>
  );
}
