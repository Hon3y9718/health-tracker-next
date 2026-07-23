import { WaterForm } from "@/components/forms/WaterForm";
import { RecentDrinks } from "@/components/lists/RecentDrinks";
import { getRecentDrinks } from "@/lib/queries/drinks";

export default async function LogWaterPage() {
  const drinks = await getRecentDrinks(10);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Log water</h1>
      <WaterForm />
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Recent</h2>
        <RecentDrinks drinks={drinks} />
      </div>
    </div>
  );
}
