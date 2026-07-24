import type { Drink } from "@/lib/queries/drinks";
import { deleteDrinkAction, bulkDeleteDrinksAction } from "@/app/log/water/actions";
import { groupByLogDate, formatDateHeading } from "@/lib/date-grouping";
import { BulkSelectProvider, BulkActionBar } from "@/components/BulkSelect";
import { EntryRow } from "@/components/lists/EntryRow";

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
                <EntryRow
                  key={drink.id}
                  id={drink.id}
                  editHref={`/log/water/${drink.id}`}
                  deleteAction={deleteDrinkAction}
                  confirmTitle="Delete this drink?"
                >
                  {drink.drink_type} · {drink.amount_l}L
                </EntryRow>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BulkActionBar onDelete={bulkDeleteDrinksAction} itemLabel="drinks" />
    </BulkSelectProvider>
  );
}
