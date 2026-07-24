import Link from "next/link";
import type { Exercise } from "@/lib/queries/exercises";
import { deleteExerciseAction, bulkDeleteExercisesAction } from "@/app/log/exercise/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, SelectCheckbox, BulkActionBar } from "@/components/BulkSelect";

export function RecentExercises({
  exercises,
  todayStr,
  hasFilter = false,
}: {
  exercises: Exercise[];
  todayStr: string;
  hasFilter?: boolean;
}) {
  if (exercises.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        {hasFilter ? "No exercise entries match this filter." : "No exercise logged yet."}
      </p>
    );
  }

  const groups = groupByLogDate(exercises);

  return (
    <BulkSelectProvider>
      <div className="flex flex-col gap-6 w-full">
        {groups.map((group) => (
          <section key={group.logDate} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[var(--ink-secondary)]">
              {formatDateHeading(group.logDate, todayStr)}
            </h3>
            <ul className="flex flex-col gap-2 w-full">
              {group.items.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--gridline)] px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <SelectCheckbox id={ex.id} className="h-4 w-4 accent-[var(--foreground)]" />
                    {ex.exercise_type}
                    {ex.duration_minutes !== null ? ` · ${ex.duration_minutes} min` : ""}
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <Link href={`/log/exercise/${ex.id}`} className="underline underline-offset-2">
                      Edit
                    </Link>
                    <form action={deleteExerciseAction}>
                      <input type="hidden" name="id" value={ex.id} />
                      <button
                        type="submit"
                        className="text-[var(--status-critical)] underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteExercisesAction} itemLabel="exercise entries" />
    </BulkSelectProvider>
  );
}
