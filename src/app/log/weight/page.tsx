import { WeightForm } from "@/components/forms/WeightForm";
import { RecentWeighIns } from "@/components/lists/RecentWeighIns";
import { getRecentWeighIns } from "@/lib/queries/weighIns";

export default async function LogWeightPage() {
  const weighIns = await getRecentWeighIns(10);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Log weight</h1>
      <WeightForm />
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Recent</h2>
        <RecentWeighIns weighIns={weighIns} />
      </div>
    </div>
  );
}
