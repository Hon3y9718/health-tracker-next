import Link from "next/link";
import type { Meal } from "@/lib/queries/meals";
import { deleteMealAction } from "@/app/log/meal/actions";

export function RecentMeals({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No meals logged yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 w-full max-w-sm">
      {meals.map((meal) => (
        <li
          key={meal.id}
          className="flex items-center justify-between gap-2 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          <span>
            {meal.log_date} · {meal.title || meal.meal_label || "Meal"} · {meal.calories} kcal
            {meal.protein_g !== null ? ` · ${meal.protein_g}g protein` : ""}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <Link href={`/log/meal/${meal.id}`} className="underline underline-offset-2">
              Edit
            </Link>
            <form action={deleteMealAction}>
              <input type="hidden" name="id" value={meal.id} />
              <button type="submit" className="text-[var(--status-critical)] underline underline-offset-2">
                Delete
              </button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
