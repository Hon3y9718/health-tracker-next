"use server";

import { redirect } from "next/navigation";
import { updateUserSettings } from "@/lib/queries/settings";

export type SettingsState = { error?: string } | undefined;

function requiredNumber(formData: FormData, key: string): number | undefined {
  const value = formData.get(key);
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Rule (CLAUDE.md #1): this is the one place targets get written. Every view reads them
// live, so saving here recomputes history immediately -- there's nothing else to update.
export async function updateSettings(
  _state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const calorieTarget = requiredNumber(formData, "calorie_target");
  const proteinTarget = requiredNumber(formData, "protein_target_g");
  const fiberTarget = requiredNumber(formData, "fiber_target_g");
  const waterTarget = requiredNumber(formData, "water_target_l");
  const startingWeight = requiredNumber(formData, "starting_weight_kg");
  const goalLow = requiredNumber(formData, "goal_weight_low_kg");
  const goalHigh = requiredNumber(formData, "goal_weight_high_kg");
  const heightCm = requiredNumber(formData, "height_cm");

  if (
    calorieTarget === undefined ||
    proteinTarget === undefined ||
    fiberTarget === undefined ||
    waterTarget === undefined ||
    startingWeight === undefined ||
    goalLow === undefined ||
    goalHigh === undefined
  ) {
    return { error: "All targets except height are required." };
  }

  if (goalHigh < goalLow) {
    return { error: "Goal band high must be at or above the low end." };
  }

  try {
    await updateUserSettings({
      calorie_target: calorieTarget,
      protein_target_g: proteinTarget,
      fiber_target_g: fiberTarget,
      water_target_l: waterTarget,
      starting_weight_kg: startingWeight,
      goal_weight_low_kg: goalLow,
      goal_weight_high_kg: goalHigh,
      height_cm: heightCm ?? null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save settings." };
  }

  redirect("/");
}
