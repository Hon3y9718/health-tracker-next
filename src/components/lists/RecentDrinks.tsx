import Link from "next/link";
import type { Drink } from "@/lib/queries/drinks";
import { deleteDrinkAction, bulkDeleteDrinksAction } from "@/app/log/water/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, SelectCheckbox, BulkActionBar } from "@/components/BulkSelect";

export function RecentDrinks({
  drinks,
  todayStr,
  hasFilter = false,
}: {
  drinks: Drink[];
  todayStr: string;
  hasFilter?: boolean;
}) {
  if (drinks.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        {hasFilter ? "No drinks match this filter." : "No drinks logged yet."}
      </p>
    );
  }

  const groups = groupByLogDate(drinks);

  return (
    <BulkSelectProvider>
      <div className="flex flex-col gap-6 w-full">
        {groups.map((group) => (
          <section key={group.logDate} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[var(--ink-secondary)]">
              {formatDateHeading(group.logDate, todayStr)}
            </h3>
            <ul className="flex flex-col gap-2 w-full">
              {group.items.map((drink) => (
                <li
                  key={drink.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--gridline)] px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <SelectCheckbox id={drink.id} className="h-4 w-4 accent-[var(--foreground)]" />
                    {drink.drink_type} · {drink.amount_l}L
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <Link href={`/log/water/${drink.id}`} className="underline underline-offset-2">
                      Edit
                    </Link>
                    <form action={deleteDrinkAction}>
                      <input type="hidden" name="id" value={drink.id} />
                      <button
                        type="submit"
                        className="text-[var(--status-critical)] underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteDrinksAction} itemLabel="drinks" />
    </BulkSelectProvider>
  );
}
