import { shiftDateString } from "@/lib/date-grouping";

// Scoped exception to the no-streak-mechanics rule (confirmed with the user): the original
// concern was calorie/food streaks pushing compensatory under-eating after a missed day.
// An exercise streak doesn't carry that same risk, so it's treated as a narrower carve-out
// rather than a reversal of the rule for calories/water/protein, which stay streak-free.
//
// "Today" doesn't break the streak just because it hasn't been logged yet -- the day isn't
// over. The streak only actually breaks once a full day passes with nothing logged.
export function computeCurrentStreak(
  days: { log_date: string | null; session_count: number | null }[],
  todayStr: string,
): number {
  const activeDates = new Set(
    days.filter((d) => (d.session_count ?? 0) > 0 && d.log_date).map((d) => d.log_date as string),
  );

  let cursor = activeDates.has(todayStr) ? todayStr : shiftDateString(todayStr, -1);
  if (!activeDates.has(cursor)) return 0;

  let streak = 0;
  while (activeDates.has(cursor)) {
    streak++;
    cursor = shiftDateString(cursor, -1);
  }
  return streak;
}
