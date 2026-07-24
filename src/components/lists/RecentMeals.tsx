import type { Meal } from "@/lib/queries/meals";
import { getMealImageUrls } from "@/lib/queries/meals";
import { bulkDeleteMealsAction } from "@/app/log/meal/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, BulkActionBar } from "@/components/BulkSelect";
import { MealCard } from "@/components/lists/MealCard";

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
                ].filter((m): m is string => m !== null);

                return (
                  <MealCard key={meal.id} meal={meal} imageUrl={imageUrl} macros={macros} />
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
