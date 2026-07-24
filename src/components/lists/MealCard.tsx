"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Meal } from "@/lib/queries/meals";
import { deleteMealAction } from "@/app/log/meal/actions";
import { SelectCheckbox } from "@/components/BulkSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditIcon, DeleteIcon } from "@/components/icons";

// The whole card is tappable (opens edit) since that's the most common action; the
// checkbox/edit/delete controls stop propagation so they don't also trigger navigation.
// Edit/delete are real 44px touch targets, not bare icons, so they're reliably tappable on
// mobile. Delete never fires directly from the icon -- it only opens ConfirmDialog, and the
// actual deletion happens through the existing hidden form + deleteMealAction on confirm.
export function MealCard({
  meal,
  imageUrl,
  macros,
}: {
  meal: Meal;
  imageUrl: string | undefined;
  macros: string[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const editHref = `/log/meal/${meal.id}`;

  return (
    <li
      onClick={() => router.push(editHref)}
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-[var(--gridline)]"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SelectCheckbox id={meal.id} />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset */}
      <img
        src={imageUrl ?? "/meal-placeholder.svg"}
        alt=""
        className="aspect-square w-full bg-[var(--gridline)] object-cover"
      />

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-sm font-medium">{meal.title || meal.meal_label || "Meal"}</span>
        <span className="text-sm">
          {meal.calories} kcal
          {meal.protein_g !== null ? ` · ${meal.protein_g}g protein` : ""}
        </span>
        {macros.length > 0 && (
          <span className="text-xs text-[var(--ink-muted)]">{macros.join(" · ")}</span>
        )}

        <div className="-ml-3 mt-1 flex items-center">
          <Link
            href={editHref}
            aria-label="Edit meal"
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 w-11 items-center justify-center text-[var(--ink-secondary)]"
          >
            <EditIcon />
          </Link>
          <button
            type="button"
            aria-label="Delete meal"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="flex h-11 w-11 items-center justify-center text-[var(--status-critical)]"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <form ref={formRef} action={deleteMealAction} className="hidden">
        <input type="hidden" name="id" value={meal.id} />
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this meal?"
        description="This can't be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </li>
  );
}
