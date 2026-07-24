import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { deleteExerciseAction } from "@/app/log/exercise/actions";
import { TopNav } from "@/components/TopNav";

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
      <TopNav />
      <h1 className="text-2xl font-semibold">Edit exercise</h1>
      <ExerciseForm exercise={exercise} />
      <DeleteEntryButton id={exercise.id} action={deleteExerciseAction} />
    </div>
  );
}
