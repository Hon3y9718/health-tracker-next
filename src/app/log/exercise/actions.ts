"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createExercise, deleteExercise, updateExercise } from "@/lib/queries/exercises";

export type LogExerciseState = { error?: string } | undefined;

export async function logExercise(
  _state: LogExerciseState,
  formData: FormData,
): Promise<LogExerciseState> {
  const exerciseType = String(formData.get("exercise_type") ?? "").trim();
  if (!exerciseType) {
    return { error: "What did you do is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  const durationRaw = formData.get("duration_minutes");
  const duration =
    durationRaw !== null && durationRaw !== "" ? Number(durationRaw) : undefined;

  try {
    await createExercise({
      exercise_type: exerciseType,
      duration_minutes: duration !== undefined && Number.isFinite(duration) ? duration : null,
      notes: (formData.get("notes") as string) || null,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log exercise." };
  }

  redirect("/");
}

export async function deleteExerciseAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteExercise(id);
  revalidatePath("/log/exercise");
  revalidatePath("/");
}

export type EditExerciseState = { error?: string } | undefined;

export async function editExercise(
  _state: EditExerciseState,
  formData: FormData,
): Promise<EditExerciseState> {
  const id = String(formData.get("id") ?? "");
  const exerciseType = String(formData.get("exercise_type") ?? "").trim();
  if (!id || !exerciseType) {
    return { error: "What did you do is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  const durationRaw = formData.get("duration_minutes");
  const duration =
    durationRaw !== null && durationRaw !== "" ? Number(durationRaw) : undefined;

  try {
    await updateExercise(id, {
      exercise_type: exerciseType,
      duration_minutes: duration !== undefined && Number.isFinite(duration) ? duration : null,
      notes: (formData.get("notes") as string) || null,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update exercise." };
  }

  redirect("/log/exercise");
}
