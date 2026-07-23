"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMeal, deleteMeal, updateMeal } from "@/lib/queries/meals";

export type LogMealState = { error?: string } | undefined;

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Rule (CLAUDE.md #2): calories is the only field this actually requires.
export async function logMeal(
  _state: LogMealState,
  formData: FormData,
): Promise<LogMealState> {
  const calories = numberOrUndefined(formData.get("calories"));
  if (calories === undefined) {
    return { error: "Calories is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await createMeal({
      calories,
      protein_g: numberOrUndefined(formData.get("protein_g")) ?? null,
      carbs_g: numberOrUndefined(formData.get("carbs_g")) ?? null,
      fat_g: numberOrUndefined(formData.get("fat_g")) ?? null,
      fiber_g: numberOrUndefined(formData.get("fiber_g")) ?? null,
      title: (formData.get("title") as string) || null,
      meal_label: (formData.get("meal_label") as string) || null,
      notes: (formData.get("notes") as string) || null,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log meal." };
  }

  redirect("/");
}

export async function deleteMealAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteMeal(id);
  revalidatePath("/log/meal");
  revalidatePath("/");
}

export type EditMealState = { error?: string } | undefined;

export async function editMeal(
  _state: EditMealState,
  formData: FormData,
): Promise<EditMealState> {
  const id = String(formData.get("id") ?? "");
  const calories = numberOrUndefined(formData.get("calories"));
  if (!id || calories === undefined) {
    return { error: "Calories is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await updateMeal(id, {
      calories,
      protein_g: numberOrUndefined(formData.get("protein_g")) ?? null,
      carbs_g: numberOrUndefined(formData.get("carbs_g")) ?? null,
      fat_g: numberOrUndefined(formData.get("fat_g")) ?? null,
      fiber_g: numberOrUndefined(formData.get("fiber_g")) ?? null,
      title: (formData.get("title") as string) || null,
      meal_label: (formData.get("meal_label") as string) || null,
      notes: (formData.get("notes") as string) || null,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update meal." };
  }

  redirect("/log/meal");
}
