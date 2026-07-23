import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { RecentExercises } from "@/components/lists/RecentExercises";
import { getRecentExercises } from "@/lib/queries/exercises";

export default async function LogExercisePage() {
  const exercises = await getRecentExercises(10);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Log exercise</h1>
      <ExerciseForm />
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Recent</h2>
        <RecentExercises exercises={exercises} />
      </div>
    </div>
  );
}
