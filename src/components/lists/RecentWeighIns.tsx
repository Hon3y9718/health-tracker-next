import Link from "next/link";
import type { WeighIn } from "@/lib/queries/weighIns";
import { deleteWeighInAction } from "@/app/log/weight/actions";

export function RecentWeighIns({ weighIns }: { weighIns: WeighIn[] }) {
  if (weighIns.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No weigh-ins logged yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 w-full max-w-sm">
      {weighIns.map((w) => (
        <li
          key={w.id}
          className="flex items-center justify-between gap-2 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          <span>
            {w.log_date} · {w.weight_kg}kg
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <Link href={`/log/weight/${w.id}`} className="underline underline-offset-2">
              Edit
            </Link>
            <form action={deleteWeighInAction}>
              <input type="hidden" name="id" value={w.id} />
              <button type="submit" className="text-[var(--status-critical)] underline underline-offset-2">
                Delete
              </button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
