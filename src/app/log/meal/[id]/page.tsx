import { notFound } from "next/navigation";
import { getMealById } from "@/lib/queries/meals";
import { MealForm } from "@/components/forms/MealForm";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getMealById(id);
  if (!meal) notFound();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Edit meal</h1>
      <MealForm meal={meal} />
    </div>
  );
}
