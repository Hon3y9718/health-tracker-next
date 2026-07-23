import Link from "next/link";
import { getUserSettings } from "@/lib/queries/settings";
import {
  getDailyTotals,
  getRecentDailyTotals,
  getWeeklyTotals,
  getWeightProgress,
} from "@/lib/queries/totals";
import { getExerciseDays } from "@/lib/queries/exercises";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightChart } from "@/components/WeightChart";
import { DailyBarChart } from "@/components/DailyBarChart";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { LogoutButton } from "@/components/LogoutButton";
import { TimezoneSync } from "@/components/TimezoneSync";

// "Today" must agree with the user's local calendar day, not the server's UTC clock --
// user_settings.timezone is kept in sync with the browser by <TimezoneSync />.
function todayLogDate(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
}

export default async function DashboardPage() {
  const settings = await getUserSettings();
  const today = todayLogDate(settings.timezone);

  const [daily, weekly, weightProgress, recentDaily, exerciseDays] = await Promise.all([
    getDailyTotals(today),
    getWeeklyTotals(1),
    getWeightProgress(60),
    getRecentDailyTotals(14),
    getExerciseDays(371),
  ]);

  const thisWeek = weekly[0];
  const latestWeight = weightProgress[0];

  return (
    <div className="flex flex-1 flex-col gap-8 max-w-2xl mx-auto w-full p-6">
      <TimezoneSync currentTimezone={settings.timezone} />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Health tracker</h1>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-[var(--ink-secondary)] underline underline-offset-2">
            Goals
          </Link>
          <LogoutButton />
        </div>
      </header>

      <nav className="flex gap-3">
        <Link
          href="/log/meal"
          className="flex-1 text-center rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-3 font-medium"
        >
          Log meal
        </Link>
        <Link
          href="/log/water"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium"
        >
          Log water
        </Link>
        <Link
          href="/log/weight"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium"
        >
          Log weight
        </Link>
        <Link
          href="/log/exercise"
          className="flex-1 text-center rounded-md border border-[var(--gridline)] px-4 py-3 font-medium"
        >
          Log exercise
        </Link>
      </nav>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Today</h2>
        {daily ? (
          <div className="grid grid-cols-2 gap-4">
            <StatTile
              label="Calories"
              value={`${Math.round(daily.calories ?? 0)} / ${daily.calorie_target}`}
              badge={<StatusBadge kind="calorie" status={daily.calorie_status!} />}
            />
            <StatTile
              label="Protein"
              value={`${daily.protein_g ?? 0}g / ${daily.protein_target_g}g`}
              badge={<StatusBadge kind="level" status={daily.protein_status!} />}
              emphasize
            />
            <StatTile
              label="Water"
              value={`${daily.water_l ?? 0}L / ${daily.water_target_l}L`}
              badge={<StatusBadge kind="level" status={daily.water_status!} />}
            />
            <StatTile label="Fiber" value={`${daily.fiber_g ?? "—"}g / ${daily.fiber_target_g}g`} />
          </div>
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
            <StatTile
              label="Avg calories"
              value={`${thisWeek.avg_calories ?? 0} / ${thisWeek.calorie_target}`}
              badge={<StatusBadge kind="calorie" status={thisWeek.calorie_status!} />}
            />
            <StatTile
              label="Avg protein"
              value={`${thisWeek.avg_protein_g ?? 0}g / ${thisWeek.protein_target_g}g`}
              badge={<StatusBadge kind="level" status={thisWeek.protein_status!} />}
              emphasize
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">No days logged this week yet.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Last 14 days</h2>
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
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Activity</h2>
        <ActivityHeatmap data={exerciseDays} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-secondary)]">Weight</h2>
        <WeightChart data={weightProgress} />
        {latestWeight && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <StatTile
              label="7-day average"
              value={
                latestWeight.rolling_7d_avg !== null
                  ? `${latestWeight.rolling_7d_avg.toFixed(1)}kg`
                  : "—"
              }
            />
            <StatTile
              label="To goal"
              value={
                latestWeight.to_goal_kg !== null
                  ? `${latestWeight.to_goal_kg.toFixed(1)}kg`
                  : "—"
              }
            />
          </div>
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
