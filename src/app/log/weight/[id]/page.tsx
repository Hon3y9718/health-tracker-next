import { notFound } from "next/navigation";
import { getWeighInById } from "@/lib/queries/weighIns";
import { WeightForm } from "@/components/forms/WeightForm";

export default async function EditWeighInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const weighIn = await getWeighInById(id);
  if (!weighIn) notFound();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Edit weigh-in</h1>
      <WeightForm weighIn={weighIn} />
    </div>
  );
}
