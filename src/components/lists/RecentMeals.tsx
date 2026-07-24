import Link from "next/link";
import type { Meal } from "@/lib/queries/meals";
import { getMealImageUrls } from "@/lib/queries/meals";
import { deleteMealAction, bulkDeleteMealsAction } from "@/app/log/meal/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, SelectCheckbox, BulkActionBar } from "@/components/BulkSelect";

// Cards, not rows: photo (when present) as the card's top, macros underneath, grouped under
// a heading per day (rule #7: log_date is the grouping key, never a derived timestamp).
// Signed URLs are batched into one Storage API call for the whole list (not one per meal),
// and only requested when this list actually renders -- never on the dashboard.
export async function RecentMeals({
  meals,
  todayStr,
  hasFilter = false,
}: {
  meals: Meal[];
  todayStr: string;
  hasFilter?: boolean;
}) {
  if (meals.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        {hasFilter ? "No meals match this filter." : "No meals logged yet."}
      </p>
    );
  }

  const imageUrlById = await getMealImageUrls(meals);
  const groups = groupByLogDate(meals);

  return (
    <BulkSelectProvider>
      <div className="flex flex-col gap-6 w-full">
        {groups.map((group) => (
          <section key={group.logDate} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[var(--ink-secondary)]">
              {formatDateHeading(group.logDate, todayStr)}
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {group.items.map((meal) => {
                const imageUrl = imageUrlById.get(meal.id);
                const macros = [
                  meal.carbs_g !== null ? `${meal.carbs_g}g carbs` : null,
                  meal.fat_g !== null ? `${meal.fat_g}g fat` : null,
                  meal.fiber_g !== null ? `${meal.fiber_g}g fiber` : null,
                ].filter(Boolean);

                return (
                  <li
                    key={meal.id}
                    className="relative rounded-lg border border-[var(--gridline)] overflow-hidden flex flex-col"
                  >
                    <SelectCheckbox id={meal.id} />
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                      <img src={imageUrl} alt="" className="w-full aspect-square object-cover" />
                    )}
                    <div className="flex flex-col gap-1 p-3 flex-1">
                      <span className="text-sm font-medium">
                        {meal.title || meal.meal_label || "Meal"}
                      </span>
                      <span className="text-sm">
                        {meal.calories} kcal
                        {meal.protein_g !== null ? ` · ${meal.protein_g}g protein` : ""}
                      </span>
                      {macros.length > 0 && (
                        <span className="text-xs text-[var(--ink-muted)]">
                          {macros.join(" · ")}
                        </span>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <Link
                          href={`/log/meal/${meal.id}`}
                          className="underline underline-offset-2"
                        >
                          Edit
                        </Link>
                        <form action={deleteMealAction}>
                          <input type="hidden" name="id" value={meal.id} />
                          <button
                            type="submit"
                            className="text-[var(--status-critical)] underline underline-offset-2"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteMealsAction} itemLabel="meals" />
    </BulkSelectProvider>
  );
}
