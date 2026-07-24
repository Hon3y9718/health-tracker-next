"use client";

import { useActionState } from "react";
import { logWeight, editWeighIn } from "@/app/log/weight/actions";
import type { WeighIn } from "@/lib/queries/weighIns";
import { ImageField } from "@/components/forms/ImageField";

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2";

export function WeightForm({
  weighIn,
  frontImageUrl,
  sideImageUrl,
  from,
}: {
  weighIn?: WeighIn;
  frontImageUrl?: string | null;
  sideImageUrl?: string | null;
  from?: string;
}) {
  const action = weighIn ? editWeighIn : logWeight;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {weighIn && <input type="hidden" name="id" value={weighIn.id} />}
      {from && <input type="hidden" name="from" value={from} />}
      <div className="flex flex-col gap-1">
        <label htmlFor="weight_kg" className="text-sm font-medium">
          Weight (kg)
        </label>
        <input
          id="weight_kg"
          name="weight_kg"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          defaultValue={weighIn?.weight_kg}
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
          defaultValue={weighIn?.log_date ?? todayLocalDate()}
          className={inputClass}
        />
      </div>

      <ImageField
        name="image_front"
        removeFieldName="remove_image_front"
        existingImageUrl={frontImageUrl}
        label="Front photo"
      />
      <ImageField
        name="image_side"
        removeFieldName="remove_image_side"
        existingImageUrl={sideImageUrl}
        label="Side photo"
      />

      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Saving…" : weighIn ? "Save changes" : "Log weight"}
      </button>
    </form>
  );
}
