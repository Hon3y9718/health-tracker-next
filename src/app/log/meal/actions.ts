"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMeal, deleteMeal, updateMeal, bulkDeleteMeals } from "@/lib/queries/meals";

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

  const image = formData.get("image");
  const imageFile = image instanceof File && image.size > 0 ? image : undefined;

  try {
    await createMeal(
      {
        calories,
        protein_g: numberOrUndefined(formData.get("protein_g")) ?? null,
        carbs_g: numberOrUndefined(formData.get("carbs_g")) ?? null,
        fat_g: numberOrUndefined(formData.get("fat_g")) ?? null,
        fiber_g: numberOrUndefined(formData.get("fiber_g")) ?? null,
        title: (formData.get("title") as string) || null,
        meal_label: (formData.get("meal_label") as string) || null,
        notes: (formData.get("notes") as string) || null,
        log_date: logDate,
      },
      imageFile,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log meal." };
  }

  redirect(formData.get("from") === "history" ? "/history?tab=meals" : "/");
}

export async function deleteMealAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteMeal(id);
  revalidatePath("/");
  revalidatePath("/log/meal");
  redirect("/history?tab=meals");
}

// Called directly from a client component (BulkActionBar), not via a form submission --
// Server Actions support both invocation styles.
export async function bulkDeleteMealsAction(ids: string[]): Promise<void> {
  await bulkDeleteMeals(ids);
  revalidatePath("/");
  revalidatePath("/history");
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

  const image = formData.get("image");
  const removeImage = formData.get("remove_image") === "true";
  const imageAction: Parameters<typeof updateMeal>[2] =
    image instanceof File && image.size > 0
      ? { type: "replace", file: image }
      : removeImage
        ? { type: "remove" }
        : { type: "keep" };

  try {
    await updateMeal(
      id,
      {
        calories,
        protein_g: numberOrUndefined(formData.get("protein_g")) ?? null,
        carbs_g: numberOrUndefined(formData.get("carbs_g")) ?? null,
        fat_g: numberOrUndefined(formData.get("fat_g")) ?? null,
        fiber_g: numberOrUndefined(formData.get("fiber_g")) ?? null,
        title: (formData.get("title") as string) || null,
        meal_label: (formData.get("meal_label") as string) || null,
        notes: (formData.get("notes") as string) || null,
        log_date: logDate,
      },
      imageAction,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update meal." };
  }

  redirect("/history?tab=meals");
}
