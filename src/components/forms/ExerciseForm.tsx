"use client";

import { useActionState, useRef, useState } from "react";
import { logExercise, editExercise } from "@/app/log/exercise/actions";
import type { Exercise } from "@/lib/queries/exercises";

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const inputClass =
  "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2";

const PRESETS = ["Running", "Gym", "Yoga", "Swimming", "Cycling", "Walk"];

// Product principle: logging should stay near one-tap. Presets submit immediately with no
// duration/notes required -- the custom type field and notes are there when you want them,
// never blocking submission (same shape as rule #2's "only calories is required").
export function ExerciseForm({ exercise, from }: { exercise?: Exercise; from?: string }) {
  const action = exercise ? editExercise : logExercise;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [exerciseType, setExerciseType] = useState(exercise?.exercise_type ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {exercise && <input type="hidden" name="id" value={exercise.id} />}
      {from && <input type="hidden" name="from" value={from} />}
      {!exercise && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">What did you do?</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={pending}
                onClick={() => {
                  setExerciseType(preset);
                  requestAnimationFrame(() => formRef.current?.requestSubmit());
                }}
                className="rounded-full border border-[var(--gridline)] px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="exercise_type" className="text-sm text-[var(--ink-secondary)]">
          {exercise ? "What did you do?" : "Or type your own"}
        </label>
        <input
          id="exercise_type"
          name="exercise_type"
          type="text"
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="duration_minutes" className="text-sm text-[var(--ink-secondary)]">
          Duration (min) <span className="text-[var(--ink-muted)]">— optional</span>
        </label>
        <input
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          inputMode="numeric"
          defaultValue={exercise?.duration_minutes ?? undefined}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-[var(--ink-secondary)]">
          Notes <span className="text-[var(--ink-muted)]">— optional</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={exercise?.notes ?? undefined}
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
          defaultValue={exercise?.log_date ?? todayLocalDate()}
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Saving…" : exercise ? "Save changes" : "Log exercise"}
      </button>
    </form>
  );
}
