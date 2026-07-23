// Status colors follow the dataviz status palette (good/warning/serious/critical), reserved
// for state and never reused as a categorical series color.
//
// Product principle (CLAUDE.md): the "under" calorie status is never rendered as a win -- it
// gets the neutral treatment, not "good", because eating less than target isn't inherently
// an achievement.
type CalorieStatus = "under" | "on_target" | "over" | "way_over";
type LevelStatus = "hit" | "close" | "low";

const CALORIE_LABEL: Record<CalorieStatus, string> = {
  under: "Under",
  on_target: "On target",
  over: "Over",
  way_over: "Way over",
};

const LEVEL_LABEL: Record<LevelStatus, string> = {
  hit: "Hit",
  close: "Close",
  low: "Low",
};

const NEUTRAL = "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]";
const GOOD = "bg-[var(--status-good)]/15 text-[var(--status-good)]";
const WARNING = "bg-[var(--status-warning)]/20 text-[var(--status-warning)]";
const SERIOUS = "bg-[var(--status-serious)]/20 text-[var(--status-serious)]";
const CRITICAL = "bg-[var(--status-critical)]/15 text-[var(--status-critical)]";

function badgeClasses(kind: "calorie" | "level", status: string): string {
  if (kind === "calorie") {
    switch (status as CalorieStatus) {
      case "under":
        return NEUTRAL;
      case "on_target":
        return GOOD;
      case "over":
        return SERIOUS;
      case "way_over":
        return CRITICAL;
    }
  }
  switch (status as LevelStatus) {
    case "hit":
      return GOOD;
    case "close":
      return WARNING;
    case "low":
      return SERIOUS;
  }
  return NEUTRAL;
}

export function StatusBadge({
  kind,
  status,
}: {
  kind: "calorie" | "level";
  status: string;
}) {
  const label = kind === "calorie" ? CALORIE_LABEL[status as CalorieStatus] : LEVEL_LABEL[status as LevelStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses(kind, status)}`}
    >
      {label ?? status}
    </span>
  );
}
