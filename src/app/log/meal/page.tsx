import { MealForm } from "@/components/forms/MealForm";
import { RecentMeals } from "@/components/lists/RecentMeals";
import { getRecentMeals } from "@/lib/queries/meals";

export default async function LogMealPage() {
  const meals = await getRecentMeals(10);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Log a meal</h1>
      <MealForm />
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Recent</h2>
        <RecentMeals meals={meals} />
      </div>
    </div>
  );
}
