"use client";

import { useActionState, useRef, useState } from "react";
import { logWater, editDrink } from "@/app/log/water/actions";
import type { Drink } from "@/lib/queries/drinks";

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2";

const PRESETS = [
  { label: "Glass (0.25L)", value: 0.25 },
  { label: "Bottle (0.5L)", value: 0.5 },
  { label: "Large bottle (1L)", value: 1 },
];

// Product principle: logging water must be near one-tap. Presets submit immediately;
// the custom amount is a fallback, not the default path.
export function WaterForm({ drink, from }: { drink?: Drink; from?: string }) {
  const action = drink ? editDrink : logWater;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [amount, setAmount] = useState(drink ? String(drink.amount_l) : "0.25");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {drink && <input type="hidden" name="id" value={drink.id} />}
      {from && <input type="hidden" name="from" value={from} />}
      {!drink && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Quick log</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                disabled={pending}
                onClick={() => {
                  setAmount(String(preset.value));
                  requestAnimationFrame(() => formRef.current?.requestSubmit());
                }}
                className="rounded-full border border-[var(--gridline)] px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="amount_l" className="text-sm text-[var(--ink-secondary)]">
          Amount (L)
        </label>
        <input
          id="amount_l"
          name="amount_l"
          type="number"
          step="0.05"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="drink_type" className="text-sm text-[var(--ink-secondary)]">
          Type
        </label>
        <select
          id="drink_type"
          name="drink_type"
          defaultValue={drink?.drink_type ?? "Water"}
          className={inputClass}
        >
          <option>Water</option>
          <option>Coffee/Tea</option>
          <option>Buttermilk/Lassi</option>
          <option>Electrolyte</option>
          <option>Other</option>
        </select>
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
          defaultValue={drink?.log_date ?? todayLocalDate()}
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Saving…" : drink ? "Save changes" : "Log drink"}
      </button>
    </form>
  );
}
