import type { ExerciseDay } from "@/lib/queries/exercises";
import { computeCurrentStreak } from "@/lib/streak";

const WEEKS = 53;

function heatColor(count: number): string {
  if (count <= 0) return "var(--heat-0)";
  if (count === 1) return "var(--heat-1)";
  if (count === 2) return "var(--heat-2)";
  return "var(--heat-3)";
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildWeeks(totalWeeks: number, today: Date): Date[][] {
  const start = new Date(today);
  start.setDate(start.getDate() - totalWeeks * 7 + 1);
  start.setDate(start.getDate() - start.getDay()); // back up to the Sunday on/before start

  const numWeeks =
    Math.ceil((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < numWeeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// Product principle (CLAUDE.md): no streak mechanics for calories/protein/water -- those
// stay a neutral historical record, per the rule's original concern about compensatory
// under-eating after a missed day. The streak count below is a confirmed, scoped exception
// for exercise specifically, which doesn't carry that same risk.
export function ActivityHeatmap({ data, todayStr }: { data: ExerciseDay[]; todayStr: string }) {
  const [y, m, d] = todayStr.split("-").map(Number);
  const today = new Date(y, m - 1, d);

  const byDate = new Map(data.map((day) => [day.log_date!, day]));
  const weeks = buildWeeks(WEEKS, today);
  const activeDays = data.filter((day) => (day.session_count ?? 0) > 0).length;
  const streak = computeCurrentStreak(data, todayStr);

  return (
    <div>
      {streak > 0 && (
        <p className="text-sm mb-2">
          <span className="text-2xl font-semibold tabular-nums">{streak}</span>
          <span className="text-[var(--ink-muted)]"> day{streak === 1 ? "" : "s"} in a row</span>
        </p>
      )}
      <div className="overflow-x-auto pb-1">
        <div
          className="inline-grid grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 10px)" }}
        >
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              const key = formatDateKey(date);
              const isFuture = date > today;
              const day = byDate.get(key);
              const count = day?.session_count ?? 0;
              const title = isFuture
                ? undefined
                : count > 0
                  ? `${key} — ${count} session${count > 1 ? "s" : ""}${
                      day?.exercise_types?.length ? `: ${day.exercise_types.join(", ")}` : ""
                    }`
                  : `${key} — no exercise logged`;

              return (
                <div
                  key={`${wi}-${di}`}
                  title={title}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{ background: isFuture ? "transparent" : heatColor(count) }}
                />
              );
            }),
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--ink-muted)] mt-2">
        {activeDays} day{activeDays === 1 ? "" : "s"} with exercise logged in the last year.
      </p>
    </div>
  );
}
