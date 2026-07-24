// Rule (CLAUDE.md #4): this only picks a color for a status string the daily_totals /
// weekly_totals views already computed -- it never re-derives the threshold itself.
// Shared by DailyBarChart and TargetMeter so the two don't carry separate copies.
type CalorieStatus = "under" | "on_target" | "over" | "way_over";
type LevelStatus = "hit" | "close" | "low";

export function statusColor(kind: "calorie" | "level", status: string | null): string {
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
