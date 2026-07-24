import { notFound } from "next/navigation";
import { getWeighInById } from "@/lib/queries/weighIns";
import { getWeighInImages, getWeighInImageUrl } from "@/lib/queries/weighInImages";
import { WeightForm } from "@/components/forms/WeightForm";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { deleteWeighInAction } from "@/app/log/weight/actions";
import { TopNav } from "@/components/TopNav";

export default async function EditWeighInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const weighIn = await getWeighInById(id);
  if (!weighIn) notFound();

  const images = await getWeighInImages(id);
  const front = images.find((img) => img.label === "Front");
  const side = images.find((img) => img.label === "Side");
  const [frontImageUrl, sideImageUrl] = await Promise.all([
    front ? getWeighInImageUrl(front) : null,
    side ? getWeighInImageUrl(side) : null,
  ]);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav />
      <h1 className="text-2xl font-semibold">Edit weigh-in</h1>
      <WeightForm weighIn={weighIn} frontImageUrl={frontImageUrl} sideImageUrl={sideImageUrl} />
      <DeleteEntryButton id={weighIn.id} action={deleteWeighInAction} />
    </div>
  );
}
