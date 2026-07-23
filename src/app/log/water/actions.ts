"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createDrink, deleteDrink, updateDrink } from "@/lib/queries/drinks";

export type LogWaterState = { error?: string } | undefined;

export async function logWater(
  _state: LogWaterState,
  formData: FormData,
): Promise<LogWaterState> {
  const amountL = Number(formData.get("amount_l"));
  if (!Number.isFinite(amountL) || amountL <= 0) {
    return { error: "Amount is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await createDrink({
      amount_l: amountL,
      drink_type: (formData.get("drink_type") as string) || "Water",
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log drink." };
  }

  redirect("/");
}

export async function deleteDrinkAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteDrink(id);
  revalidatePath("/log/water");
  revalidatePath("/");
}

export type EditDrinkState = { error?: string } | undefined;

export async function editDrink(
  _state: EditDrinkState,
  formData: FormData,
): Promise<EditDrinkState> {
  const id = String(formData.get("id") ?? "");
  const amountL = Number(formData.get("amount_l"));
  if (!id || !Number.isFinite(amountL) || amountL <= 0) {
    return { error: "Amount is required." };
  }

  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) {
    return { error: "Date is required." };
  }

  try {
    await updateDrink(id, {
      amount_l: amountL,
      drink_type: (formData.get("drink_type") as string) || "Water",
      log_date: logDate,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update drink." };
  }

  redirect("/log/water");
}
