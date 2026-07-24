import { notFound } from "next/navigation";
import { getMealById, getMealImageUrl } from "@/lib/queries/meals";
import { MealForm } from "@/components/forms/MealForm";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { deleteMealAction } from "@/app/log/meal/actions";
import { TopNav } from "@/components/TopNav";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getMealById(id);
  if (!meal) notFound();

  const imageUrl = await getMealImageUrl(meal);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav />
      <h1 className="text-2xl font-semibold">Edit meal</h1>
      <MealForm meal={meal} imageUrl={imageUrl} />
      <DeleteEntryButton id={meal.id} action={deleteMealAction} />
    </div>
  );
}
