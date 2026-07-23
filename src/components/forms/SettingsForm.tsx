"use client";

import { useActionState } from "react";
import { updateSettings } from "@/app/settings/actions";
import type { UserSettings } from "@/lib/queries/settings";

const inputClass =
  "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2";

// Rule (CLAUDE.md #1): every field here is a target/reference number read from
// user_settings -- nothing in this app hardcodes 2000/150/3.0/101/72.5 outside this form's
// defaults and the migration/seed defaults.
export function SettingsForm({ settings }: { settings: UserSettings }) {
  const [state, formAction, pending] = useActionState(updateSettings, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="calorie_target" className="text-sm font-medium">
          Calorie target
        </label>
        <input
          id="calorie_target"
          name="calorie_target"
          type="number"
          required
          defaultValue={settings.calorie_target}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="protein_target_g" className="text-sm font-medium">
          Protein target (g)
        </label>
        <input
          id="protein_target_g"
          name="protein_target_g"
          type="number"
          required
          defaultValue={settings.protein_target_g}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fiber_target_g" className="text-sm">
          Fiber target (g)
        </label>
        <input
          id="fiber_target_g"
          name="fiber_target_g"
          type="number"
          required
          defaultValue={settings.fiber_target_g}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="water_target_l" className="text-sm">
          Water target (L)
        </label>
        <input
          id="water_target_l"
          name="water_target_l"
          type="number"
          step="0.1"
          required
          defaultValue={settings.water_target_l}
          className={inputClass}
        />
      </div>

      <hr className="border-[var(--gridline)]" />

      <div className="flex flex-col gap-1">
        <label htmlFor="starting_weight_kg" className="text-sm">
          Starting weight (kg)
        </label>
        <input
          id="starting_weight_kg"
          name="starting_weight_kg"
          type="number"
          step="0.1"
          required
          defaultValue={settings.starting_weight_kg}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="goal_weight_low_kg" className="text-sm">
            Goal band low (kg)
          </label>
          <input
            id="goal_weight_low_kg"
            name="goal_weight_low_kg"
            type="number"
            step="0.1"
            required
            defaultValue={settings.goal_weight_low_kg}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="goal_weight_high_kg" className="text-sm">
            Goal band high (kg)
          </label>
          <input
            id="goal_weight_high_kg"
            name="goal_weight_high_kg"
            type="number"
            step="0.1"
            required
            defaultValue={settings.goal_weight_high_kg}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="height_cm" className="text-sm">
          Height (cm) <span className="text-[var(--ink-muted)]">— optional, for BMI</span>
        </label>
        <input
          id="height_cm"
          name="height_cm"
          type="number"
          step="0.1"
          defaultValue={settings.height_cm ?? ""}
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save goals"}
      </button>
      <p className="text-xs text-[var(--ink-muted)]">
        Changing a target recomputes every past day, not just future ones — history isn&apos;t
        stored against the old value.
      </p>
    </form>
  );
}
