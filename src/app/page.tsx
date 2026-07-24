import Link from "next/link";
import { Suspense } from "react";
import { getUserSettings } from "@/lib/queries/settings";
import {
  getDailyTotals,
  getRecentDailyTotals,
  getWeeklyTotals,
  getWeightProgress,
} from "@/lib/queries/totals";
import { getExerciseDays } from "@/lib/queries/exercises";
import { TargetMeter } from "@/components/TargetMeter";
import { WeightGoalProgress } from "@/components/WeightGoalProgress";
import { WeightChart } from "@/components/WeightChart";
import { DailyBarChart } from "@/components/DailyBarChart";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { LogoutButton } from "@/components/LogoutButton";
import { TimezoneSync } from "@/components/TimezoneSync";
import { DailyInsight, DailyInsightSkeleton } from "@/components/DailyInsight";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { todayInTimezone } from "@/lib/date-grouping";
import { HistoryIcon, GoalIcon } from "@/components/icons";
import { getAccessibleAccounts, getActiveAccountId } from "@/lib/account-context";

const CHART_DAY_OPTIONS = [7, 14, 30] as const;
const WEIGHT_DAY_OPTIONS = [30, 60, 90, 180] as const;
const HEATMAP_DAY_OPTIONS = [90, 180, 371] as const;

function parseRangeParam(value: string | undefined, options: readonly number[], fallback: number) {
  const parsed = Number(value);
  return options.includes(parsed) ? parsed : fallback;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; weightDays?: string; heatmapDays?: string }>;
}) {
  const { days: daysParam, weightDays: weightDaysParam, heatmapDays: heatmapDaysParam } =
    await searchParams;
  const chartDays = parseRangeParam(daysParam, CHART_DAY_OPTIONS, 14);
  const weightDays = parseRangeParam(weightDaysParam, WEIGHT_DAY_OPTIONS, 60);
  const heatmapDays = parseRangeParam(heatmapDaysParam, HEATMAP_DAY_OPTIONS, 371);

  function dashboardHref(overrides: { days?: number; weightDays?: number; heatmapDays?: number }) {
    const params = new URLSearchParams({
      days: String(overrides.days ?? chartDays),
      weightDays: String(overrides.weightDays ?? weightDays),
      heatmapDays: String(overrides.heatmapDays ?? heatmapDays),
    });
    return `/?${params.toString()}`;
  }

  const settings = await getUserSettings();
  const today = todayInTimezone(settings.timezone);

  const [daily, weekly, weightProgress, recentDaily, exerciseDays, accounts, activeAccountId] =
    await Promise.all([
      getDailyTotals(today),
      getWeeklyTotals(1),
      getWeightProgress(weightDays),
      getRecentDailyTotals(chartDays),
      getExerciseDays(heatmapDays),
      getAccessibleAccounts(),
      getActiveAccountId(),
    ]);

  const thisWeek = weekly[0];
  const latestWeight = weightProgress[0];

  return (
    <div className="flex flex-1 flex-col gap-8 max-w-2xl mx-auto w-full p-6">
      <TimezoneSync currentTimezone={settings.timezone} />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Health tracker</h1>
        <div className="flex items-center gap-4">
          {accounts.length > 1 && <AccountSwitcher accounts={accounts} activeId={activeAccountId} />}
          <Link href="/history" aria-label="History" title="History" className="text-[var(--ink-secondary)]">
            <HistoryIcon />
          </Link>
          <Link href="/settings" aria-label="Goals" title="Goals" className="text-[var(--ink-secondary)]">
            <GoalIcon />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <Suspense fallback={<DailyInsightSkeleton />}>
        <DailyInsight />
      </Suspense>

      <nav className="flex gap-3">
        <Link
          href="/log/meal"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Log meal
        </Link>
        <Link
          href="/log/water"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Log water
        </Link>
        <Link
          href="/log/weight"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Log weight
        </Link>
        <Link
          href="/log/exercise"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Log exercise
        </Link>
      </nav>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Today</h2>
        {daily ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <TargetMeter
                label="Calories"
                value={Math.round(daily.calories ?? 0)}
                target={daily.calorie_target!}
                unit=""
                status={daily.calorie_status!}
                statusKind="calorie"
              />
              <TargetMeter
                label="Protein"
                value={daily.protein_g ?? 0}
                target={daily.protein_target_g!}
                unit="g"
                status={daily.protein_status!}
                statusKind="level"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TargetMeter
                label="Water"
                value={daily.water_l ?? 0}
                target={daily.water_target_l!}
                unit="L"
                status={daily.water_status!}
                statusKind="level"
              />
              <TargetMeter
                label="Fiber"
                value={daily.fiber_g ?? 0}
                target={daily.fiber_target_g!}
                unit="g"
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">
            Nothing logged yet today. Target: {settings.calorie_target} kcal /{" "}
            {settings.protein_target_g}g protein / {settings.water_target_l}L water.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">This week</h2>
        {thisWeek ? (
          <div className="grid grid-cols-2 gap-4">
            <TargetMeter
              label="Avg calories"
              value={Math.round(thisWeek.avg_calories ?? 0)}
              target={thisWeek.calorie_target!}
              unit=""
              status={thisWeek.calorie_status!}
              statusKind="calorie"
            />
            <TargetMeter
              label="Avg protein"
              value={thisWeek.avg_protein_g ?? 0}
              target={thisWeek.protein_target_g!}
              unit="g"
              status={thisWeek.protein_status!}
              statusKind="level"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">No days logged this week yet.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Last {chartDays} days</h2>
          <RangeChips
            options={CHART_DAY_OPTIONS}
            value={chartDays}
            hrefFor={(v) => dashboardHref({ days: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DailyBarChart
            title="Calories"
            unit="kcal"
            target={settings.calorie_target}
            statusKind="calorie"
            rows={recentDaily.map((d) => ({
              log_date: d.log_date!,
              value: d.calories,
              status: d.calorie_status,
            }))}
          />
          <DailyBarChart
            title="Protein"
            unit="g"
            target={settings.protein_target_g}
            statusKind="level"
            rows={recentDaily.map((d) => ({
              log_date: d.log_date!,
              value: d.protein_g,
              status: d.protein_status,
            }))}
          />
        </div>
        <DailyBarChart
          title="Water"
          unit="L"
          target={settings.water_target_l}
          statusKind="level"
          rows={recentDaily.map((d) => ({
            log_date: d.log_date!,
            value: d.water_l,
            status: d.water_status,
          }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Activity</h2>
          <RangeChips
            options={HEATMAP_DAY_OPTIONS}
            value={heatmapDays}
            hrefFor={(v) => dashboardHref({ heatmapDays: v })}
          />
        </div>
        <ActivityHeatmap data={exerciseDays} todayStr={today} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Weight</h2>
          <RangeChips
            options={WEIGHT_DAY_OPTIONS}
            value={weightDays}
            hrefFor={(v) => dashboardHref({ weightDays: v })}
          />
        </div>
        {latestWeight && (
          <WeightGoalProgress
            progressPct={latestWeight.progress_pct}
            lostKg={latestWeight.lost_kg}
            toGoalKg={latestWeight.to_goal_kg}
          />
        )}
        <WeightChart data={weightProgress} />
        {latestWeight && (
          <StatTile
            label="7-day average"
            value={
              latestWeight.rolling_7d_avg !== null
                ? `${latestWeight.rolling_7d_avg.toFixed(1)}kg`
                : "—"
            }
          />
        )}
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  badge,
  emphasize,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--gridline)] p-4 flex flex-col gap-1">
      <span className="text-xs text-[var(--ink-muted)]">{label}</span>
      <span className={`text-lg ${emphasize ? "font-semibold" : "font-medium"}`}>{value}</span>
      {badge}
    </div>
  );
}

// Today/This week are anchored to the current period by definition -- there's no "date" to
// filter there. These chips only appear on the three chart sections, where "how far back"
// is a real, useful choice.
function RangeChips({
  options,
  value,
  hrefFor,
}: {
  options: readonly number[];
  value: number;
  hrefFor: (option: number) => string;
}) {
  return (
    <div className="flex gap-1">
      {options.map((option) => (
        <Link
          key={option}
          href={hrefFor(option)}
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
            value === option
              ? "border-[var(--foreground)] text-[var(--foreground)]"
              : "border-[var(--gridline)] text-[var(--ink-muted)]"
          }`}
        >
          {option}d
        </Link>
      ))}
    </div>
  );
}
