import Link from "next/link";
import type { Drink } from "@/lib/queries/drinks";
import { deleteDrinkAction } from "@/app/log/water/actions";

export function RecentDrinks({ drinks }: { drinks: Drink[] }) {
  if (drinks.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No drinks logged yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 w-full max-w-sm">
      {drinks.map((drink) => (
        <li
          key={drink.id}
          className="flex items-center justify-between gap-2 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          <span>
            {drink.log_date} · {drink.drink_type} · {drink.amount_l}L
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <Link href={`/log/water/${drink.id}`} className="underline underline-offset-2">
              Edit
            </Link>
            <form action={deleteDrinkAction}>
              <input type="hidden" name="id" value={drink.id} />
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
