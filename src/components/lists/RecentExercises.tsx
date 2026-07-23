import Link from "next/link";
import type { Exercise } from "@/lib/queries/exercises";
import { deleteExerciseAction } from "@/app/log/exercise/actions";

export function RecentExercises({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No exercise logged yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 w-full max-w-sm">
      {exercises.map((ex) => (
        <li
          key={ex.id}
          className="flex items-center justify-between gap-2 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          <span>
            {ex.log_date} · {ex.exercise_type}
            {ex.duration_minutes !== null ? ` · ${ex.duration_minutes} min` : ""}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <Link href={`/log/exercise/${ex.id}`} className="underline underline-offset-2">
              Edit
            </Link>
            <form action={deleteExerciseAction}>
              <input type="hidden" name="id" value={ex.id} />
              <button type="submit" className="text-[var(--status-critical)] underline underline-offset-2">
                Delete
              </button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
