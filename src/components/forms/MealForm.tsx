"use client";

import { useActionState } from "react";
import { logMeal, editMeal } from "@/app/log/meal/actions";
import type { Meal } from "@/lib/queries/meals";

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2";

// Rule (CLAUDE.md #2): calories is the only required input; everything else -- protein
// included -- must submit empty. Product principle: protein gets equal visual weight to
// calories, so it's the second field shown, not buried with the rest.
export function MealForm({ meal }: { meal?: Meal }) {
  const action = meal ? editMeal : logMeal;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {meal && <input type="hidden" name="id" value={meal.id} />}
      <div className="flex flex-col gap-1">
        <label htmlFor="calories" className="text-sm font-medium">
          Calories
        </label>
        <input
          id="calories"
          name="calories"
          type="number"
          inputMode="numeric"
          required
          defaultValue={meal?.calories}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="protein_g" className="text-sm font-medium">
          Protein (g)
        </label>
        <input
          id="protein_g"
          name="protein_g"
          type="number"
          inputMode="decimal"
          defaultValue={meal?.protein_g ?? undefined}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="log_date" className="text-sm text-[var(--ink-secondary)]">
          Date
        </label>
        <input
          id="log_date"
          name="log_date"
          type="date"
          required
          defaultValue={meal?.log_date ?? todayLocalDate()}
          className={inputClass}
        />
      </div>

      <details className="text-sm text-[var(--ink-secondary)]" open={!!meal}>
        <summary className="cursor-pointer select-none">More details (optional)</summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm">
              Name
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={meal?.title ?? undefined}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="carbs_g" className="text-sm">
                Carbs (g)
              </label>
              <input
                id="carbs_g"
                name="carbs_g"
                type="number"
                inputMode="decimal"
                defaultValue={meal?.carbs_g ?? undefined}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="fat_g" className="text-sm">
                Fat (g)
              </label>
              <input
                id="fat_g"
                name="fat_g"
                type="number"
                inputMode="decimal"
                defaultValue={meal?.fat_g ?? undefined}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="fiber_g" className="text-sm">
                Fiber (g)
              </label>
              <input
                id="fiber_g"
                name="fiber_g"
                type="number"
                inputMode="decimal"
                defaultValue={meal?.fiber_g ?? undefined}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="meal_label" className="text-sm">
                Label
              </label>
              <input
                id="meal_label"
                name="meal_label"
                type="text"
                list="meal-labels"
                defaultValue={meal?.meal_label ?? undefined}
                className={inputClass}
              />
              <datalist id="meal-labels">
                <option value="Meal 1" />
                <option value="Meal 2" />
                <option value="Meal 3" />
                <option value="Snack" />
                <option value="Pre-workout" />
                <option value="Post-workout" />
              </datalist>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="text-sm">
              Notes
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              defaultValue={meal?.notes ?? undefined}
              className={inputClass}
            />
          </div>
        </div>
      </details>

      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Saving…" : meal ? "Save changes" : "Log meal"}
      </button>
    </form>
  );
}
