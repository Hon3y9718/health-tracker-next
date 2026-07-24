// log_date is a plain calendar date (rule #7), not a timestamp -- every function here does
// pure Y/M/D arithmetic on the string, never `new Date(str)` + local getters, which would
// silently shift by a day depending on the server's timezone.

// "Today" must agree with the user's local calendar day, not the server's UTC clock --
// user_settings.timezone is kept in sync with the browser by <TimezoneSync />.
export function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
}

function parseDateString(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

export function shiftDateString(dateStr: string, days: number): string {
  const { y, m, d } = parseDateString(dateStr);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
}

// Monday-based, matching the week boundary weekly_totals already uses (date_trunc('week', ...)).
export function startOfWeekString(dateStr: string): string {
  const { y, m, d } = parseDateString(dateStr);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  return shiftDateString(dateStr, -daysSinceMonday);
}

export function startOfMonthString(dateStr: string): string {
  const { y, m } = parseDateString(dateStr);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

export function formatDateHeading(logDate: string, todayStr: string): string {
  if (logDate === todayStr) return "Today";
  if (logDate === shiftDateString(todayStr, -1)) return "Yesterday";

  const { y, m, d } = parseDateString(logDate);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Preserves the input order (callers already fetch ordered by log_date desc), just buckets
// consecutive/all items sharing a log_date into one group.
export function groupByLogDate<T extends { log_date: string | null }>(
  items: T[],
): { logDate: string; items: T[] }[] {
  const order: string[] = [];
  const map = new Map<string, T[]>();

  for (const item of items) {
    const key = item.log_date ?? "unknown";
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
      order.push(key);
    }
  }

  return order.map((logDate) => ({ logDate, items: map.get(logDate)! }));
}
