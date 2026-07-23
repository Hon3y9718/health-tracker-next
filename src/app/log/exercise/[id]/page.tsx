import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { ExerciseForm } from "@/components/forms/ExerciseForm";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExerciseById(id);
  if (!exercise) notFound();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Edit exercise</h1>
      <ExerciseForm exercise={exercise} />
    </div>
  );
}
