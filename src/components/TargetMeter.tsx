import { statusColor } from "@/lib/status-colors";
import { StatusBadge } from "@/components/StatusBadge";

// The "pop the win, show how far am I" tile: a big number plus a filled progress bar toward
// target, colored by the same status the view already computed. No congratulatory copy --
// the size and color carry the emphasis, the text stays factual (CLAUDE.md: never
// editorialise about intake).
//
// status/statusKind are optional: fiber has a target but no derived status column (rule #4
// says don't invent one client-side), so it still gets a bar -- just a neutral fill and no
// badge, rather than being the one tile silently missing its progress bar.
export function TargetMeter({
  label,
  value,
  target,
  unit,
  status,
  statusKind,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  status?: string;
  statusKind?: "calorie" | "level";
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const color = status && statusKind ? statusColor(statusKind, status) : "var(--series-primary)";

  return (
    <div className="rounded-lg border border-[var(--gridline)] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--ink-muted)]">{label}</span>
        {status && statusKind && <StatusBadge kind={statusKind} status={status} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-sm text-[var(--ink-muted)]">
          {unit} of {target}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--gridline)] overflow-hidden">
        <div
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
