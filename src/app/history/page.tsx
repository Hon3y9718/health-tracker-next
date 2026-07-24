import Link from "next/link";
import { getRecentMeals } from "@/lib/queries/meals";
import { getRecentDrinks } from "@/lib/queries/drinks";
import { getRecentWeighIns } from "@/lib/queries/weighIns";
import { getRecentExercises } from "@/lib/queries/exercises";
import { getUserSettings } from "@/lib/queries/settings";
import { todayInTimezone, startOfWeekString, startOfMonthString } from "@/lib/date-grouping";
import { RecentMeals } from "@/components/lists/RecentMeals";
import { RecentDrinks } from "@/components/lists/RecentDrinks";
import { RecentWeighIns } from "@/components/lists/RecentWeighIns";
import { RecentExercises } from "@/components/lists/RecentExercises";
import { TopNav } from "@/components/TopNav";
import { SearchBox } from "@/components/SearchBox";

const TABS = [
  { key: "meals", label: "Meals", logRoute: "/log/meal", logLabel: "Log Meal", searchable: true },
  { key: "water", label: "Water", logRoute: "/log/water", logLabel: "Log Water", searchable: true },
  {
    key: "weight",
    label: "Weight",
    logRoute: "/log/weight",
    logLabel: "Log Weight",
    searchable: false,
  },
  {
    key: "exercise",
    label: "Exercise",
    logRoute: "/log/exercise",
    logLabel: "Log Exercise",
    searchable: true,
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const inputClass = "rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2 text-sm";

function chipClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium ${
    active
      ? "border-[var(--foreground)] text-[var(--foreground)]"
      : "border-[var(--gridline)] text-[var(--ink-muted)]"
  }`;
}

// One tab's data at a time, not all four stacked -- keeps the page from getting cramped as
// logs accumulate, and only fetches the section actually being viewed. Entries within a tab
// are grouped under a heading per log_date (rule #7), optionally narrowed to a single date,
// a quick date range (Today/This week/This month), or a text search -- all plain GET-form /
// link-driven searchParams, no client JS needed except the debounced search box.
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; date?: string; from?: string; to?: string; q?: string }>;
}) {
  const { tab, date, from, to, q } = await searchParams;
  const activeTabInfo = TABS.find((t) => t.key === tab) ?? TABS[0];
  const activeTab: TabKey = activeTabInfo.key;
  const search = activeTabInfo.searchable ? q : undefined;
  const hasFilter = Boolean(date || from || to || search);

  const settings = await getUserSettings();
  const todayStr = todayInTimezone(settings.timezone);
  const weekStart = startOfWeekString(todayStr);
  const monthStart = startOfMonthString(todayStr);

  const isToday = date === todayStr && !from && !to;
  const isThisWeek = from === weekStart && to === todayStr && !date;
  const isThisMonth = from === monthStart && to === todayStr && !date;

  return (
    <div className="flex flex-1 flex-col gap-6 max-w-2xl mx-auto w-full p-6">
      <TopNav current="history" wide />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History</h1>
        <Link
          href={`${activeTabInfo.logRoute}?from=history`}
          className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium"
        >
          {activeTabInfo.logLabel}
        </Link>
      </div>

      <div className="sticky top-0 z-10 flex flex-col gap-3 bg-[var(--background)] pb-3 -mx-6 px-6 pt-1">
        <nav className="flex gap-2 border-b border-[var(--gridline)]">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/history?tab=${t.key}`}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--ink-muted)]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-2">
          <Link href={`/history?tab=${activeTab}&date=${todayStr}`} className={chipClass(isToday)}>
            Today
          </Link>
          <Link
            href={`/history?tab=${activeTab}&from=${weekStart}&to=${todayStr}`}
            className={chipClass(isThisWeek)}
          >
            This week
          </Link>
          <Link
            href={`/history?tab=${activeTab}&from=${monthStart}&to=${todayStr}`}
            className={chipClass(isThisMonth)}
          >
            This month
          </Link>
        </div>

        <form method="GET" action="/history" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="tab" value={activeTab} />
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-xs text-[var(--ink-muted)]">
              Exact date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={date ?? ""}
              className={inputClass}
            />
          </div>
          {activeTabInfo.searchable && (
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label htmlFor="q" className="text-xs text-[var(--ink-muted)]">
                Search
              </label>
              <SearchBox tab={activeTab} defaultValue={q ?? ""} />
            </div>
          )}
          <button
            type="submit"
            className="rounded-md border border-[var(--gridline)] px-3 py-2 text-sm font-medium"
          >
            Filter
          </button>
          {hasFilter && (
            <Link
              href={`/history?tab=${activeTab}`}
              className="text-sm text-[var(--ink-muted)] underline underline-offset-2 px-1 py-2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <HistorySection
        tab={activeTab}
        date={date}
        from={from}
        to={to}
        search={search}
        todayStr={todayStr}
        hasFilter={hasFilter}
      />
    </div>
  );
}

async function HistorySection({
  tab,
  date,
  from,
  to,
  search,
  todayStr,
  hasFilter,
}: {
  tab: TabKey;
  date?: string;
  from?: string;
  to?: string;
  search?: string;
  todayStr: string;
  hasFilter: boolean;
}) {
  switch (tab) {
    case "meals": {
      const meals = await getRecentMeals({ limit: 60, date, from, to, search });
      return <RecentMeals meals={meals} todayStr={todayStr} hasFilter={hasFilter} />;
    }
    case "water": {
      const drinks = await getRecentDrinks({ limit: 60, date, from, to, search });
      return <RecentDrinks drinks={drinks} todayStr={todayStr} hasFilter={hasFilter} />;
    }
    case "weight": {
      const weighIns = await getRecentWeighIns({ limit: 60, date, from, to });
      return <RecentWeighIns weighIns={weighIns} todayStr={todayStr} hasFilter={hasFilter} />;
    }
    case "exercise": {
      const exercises = await getRecentExercises({ limit: 60, date, from, to, search });
      return <RecentExercises exercises={exercises} todayStr={todayStr} hasFilter={hasFilter} />;
    }
  }
}
