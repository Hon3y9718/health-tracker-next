import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { TopNav } from "@/components/TopNav";

export default async function LogExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav />
      <h1 className="text-2xl font-semibold">Log exercise</h1>
      <ExerciseForm from={from} />
    </div>
  );
}
