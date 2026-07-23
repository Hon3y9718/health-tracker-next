"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createWeighIn, deleteWeighIn, updateWeighIn } from "@/lib/queries/weighIns";

export type LogWeightState = { error?: string } | undefined;

export async function logWeight(
  _state: LogWeightState,
  formData: FormData,
): Promise<LogWeightState> {
  const weightKg = Number(formData.get("weight_kg"));
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { error: "Weight is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await createWeighIn({
      weight_kg: weightKg,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log weigh-in." };
  }

  redirect("/");
}

export async function deleteWeighInAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteWeighIn(id);
  revalidatePath("/log/weight");
  revalidatePath("/");
}

export type EditWeightState = { error?: string } | undefined;

export async function editWeighIn(
  _state: EditWeightState,
  formData: FormData,
): Promise<EditWeightState> {
  const id = String(formData.get("id") ?? "");
  const weightKg = Number(formData.get("weight_kg"));
  if (!id || !Number.isFinite(weightKg) || weightKg <= 0) {
    return { error: "Weight is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await updateWeighIn(id, {
      weight_kg: weightKg,
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update weigh-in." };
  }

  redirect("/log/weight");
}
