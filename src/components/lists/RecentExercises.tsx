import type { Exercise } from "@/lib/queries/exercises";
import { deleteExerciseAction, bulkDeleteExercisesAction } from "@/app/log/exercise/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, BulkActionBar } from "@/components/BulkSelect";
import { EntryRow } from "@/components/lists/EntryRow";

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
                <EntryRow
                  key={ex.id}
                  id={ex.id}
                  editHref={`/log/exercise/${ex.id}`}
                  deleteAction={deleteExerciseAction}
                  confirmTitle="Delete this exercise entry?"
                >
                  {ex.exercise_type}
                  {ex.duration_minutes !== null ? ` · ${ex.duration_minutes} min` : ""}
                </EntryRow>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteExercisesAction} itemLabel="exercise entries" />
    </BulkSelectProvider>
  );
}
