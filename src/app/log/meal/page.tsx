import { MealForm } from "@/components/forms/MealForm";
import { TopNav } from "@/components/TopNav";

export default async function LogMealPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav />
      <h1 className="text-2xl font-semibold">Log a meal</h1>
      <MealForm from={from} />
    </div>
  );
}
