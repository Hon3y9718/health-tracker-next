"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createWeighIn,
  deleteWeighIn,
  updateWeighIn,
  bulkDeleteWeighIns,
  getWeighInById,
} from "@/lib/queries/weighIns";
import {
  addWeighInImage,
  replaceWeighInImageByLabel,
  removeWeighInImageByLabel,
} from "@/lib/queries/weighInImages";

export type LogWeightState = { error?: string } | undefined;

function fileOrUndefined(value: FormDataEntryValue | null): File | undefined {
  return value instanceof File && value.size > 0 ? value : undefined;
}

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

  const frontImage = fileOrUndefined(formData.get("image_front"));
  const sideImage = fileOrUndefined(formData.get("image_side"));

  try {
    const weighIn = await createWeighIn({
      weight_kg: weightKg,
      log_date: logDate,
    });

    if (frontImage) await addWeighInImage(weighIn.id, frontImage, "Front", weighIn.user_id);
    if (sideImage) await addWeighInImage(weighIn.id, sideImage, "Side", weighIn.user_id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not log weigh-in." };
  }

  redirect(formData.get("from") === "history" ? "/history?tab=weight" : "/");
}

export async function deleteWeighInAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteWeighIn(id);
  revalidatePath("/");
  revalidatePath("/log/weight");
  redirect("/history?tab=weight");
}

export async function bulkDeleteWeighInsAction(ids: string[]): Promise<void> {
  await bulkDeleteWeighIns(ids);
  revalidatePath("/");
  revalidatePath("/history");
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

  const frontImage = fileOrUndefined(formData.get("image_front"));
  const sideImage = fileOrUndefined(formData.get("image_side"));
  const removeFront = formData.get("remove_image_front") === "true";
  const removeSide = formData.get("remove_image_side") === "true";

  try {
    const existing = await getWeighInById(id);
    if (!existing) {
      return { error: "Weigh-in not found." };
    }

    await updateWeighIn(id, {
      weight_kg: weightKg,
      log_date: logDate,
    });

    if (frontImage) {
      await replaceWeighInImageByLabel(id, "Front", frontImage, existing.user_id);
    } else if (removeFront) {
      await removeWeighInImageByLabel(id, "Front");
    }

    if (sideImage) {
      await replaceWeighInImageByLabel(id, "Side", sideImage, existing.user_id);
    } else if (removeSide) {
      await removeWeighInImageByLabel(id, "Side");
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update weigh-in." };
  }

  redirect("/history?tab=weight");
}
