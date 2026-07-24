import Link from "next/link";
import type { WeighIn } from "@/lib/queries/weighIns";
import { getWeighInImagesForIds, getWeighInImageUrlsByImageId } from "@/lib/queries/weighInImages";
import { deleteWeighInAction, bulkDeleteWeighInsAction } from "@/app/log/weight/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, SelectCheckbox, BulkActionBar } from "@/components/BulkSelect";

// Cards, not rows: the photo is the card's main element, weight sits below it, grouped
// under a heading per day. One batched query for all rows' images, then one batched
// Storage call for every image's signed URL (not one call per image).
export async function RecentWeighIns({
  weighIns,
  todayStr,
  hasFilter = false,
}: {
  weighIns: WeighIn[];
  todayStr: string;
  hasFilter?: boolean;
}) {
  if (weighIns.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        {hasFilter ? "No weigh-ins match this filter." : "No weigh-ins logged yet."}
      </p>
    );
  }

  const imagesByWeighIn = await getWeighInImagesForIds(weighIns.map((w) => w.id));
  const allImages = [...imagesByWeighIn.values()].flat();
  const urlByImageId = await getWeighInImageUrlsByImageId(allImages);

  const cardImages = new Map(
    weighIns.map((w) => {
      const images = imagesByWeighIn.get(w.id) ?? [];
      const front = images.find((img) => img.label === "Front");
      const side = images.find((img) => img.label === "Side");
      return [
        w.id,
        {
          frontUrl: front ? urlByImageId.get(front.id) : undefined,
          sideUrl: side ? urlByImageId.get(side.id) : undefined,
        },
      ] as const;
    }),
  );
  const groups = groupByLogDate(weighIns);

  return (
    <BulkSelectProvider>
      <div className="flex flex-col gap-6 w-full">
        {groups.map((group) => (
          <section key={group.logDate} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[var(--ink-secondary)]">
              {formatDateHeading(group.logDate, todayStr)}
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {group.items.map((w) => {
                const { frontUrl, sideUrl } = cardImages.get(w.id) ?? {};
                return (
                  <li
                    key={w.id}
                    className="relative rounded-lg border border-[var(--gridline)] overflow-hidden flex flex-col"
                  >
                    <SelectCheckbox id={w.id} />
                    {(frontUrl || sideUrl) && (
                      <div className="flex">
                        {frontUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                          <img
                            src={frontUrl}
                            alt="Front"
                            className="flex-1 aspect-square object-cover"
                          />
                        )}
                        {sideUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                          <img
                            src={sideUrl}
                            alt="Side"
                            className="flex-1 aspect-square object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex flex-col gap-1 p-3">
                      <span className="text-sm font-medium">{w.weight_kg}kg</span>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <Link
                          href={`/log/weight/${w.id}`}
                          className="underline underline-offset-2"
                        >
                          Edit
                        </Link>
                        <form action={deleteWeighInAction}>
                          <input type="hidden" name="id" value={w.id} />
                          <button
                            type="submit"
                            className="text-[var(--status-critical)] underline underline-offset-2"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteWeighInsAction} itemLabel="weigh-ins" />
    </BulkSelectProvider>
  );
}
