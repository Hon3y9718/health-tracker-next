import { notFound } from "next/navigation";
import { getDrinkById } from "@/lib/queries/drinks";
import { WaterForm } from "@/components/forms/WaterForm";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { deleteDrinkAction } from "@/app/log/water/actions";
import { TopNav } from "@/components/TopNav";

export default async function EditDrinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drink = await getDrinkById(id);
  if (!drink) notFound();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav />
      <h1 className="text-2xl font-semibold">Edit drink</h1>
      <WaterForm drink={drink} />
      <DeleteEntryButton id={drink.id} action={deleteDrinkAction} />
    </div>
  );
}
