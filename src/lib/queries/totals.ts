import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account-context";
import type { Tables } from "@/types/database";

export type DailyTotals = Tables<"daily_totals">;
export type WeeklyTotals = Tables<"weekly_totals">;
export type MonthlyTotals = Tables<"monthly_totals">;
export type WeightProgress = Tables<"weight_progress">;

// Rule (CLAUDE.md #4): all totals/statuses/variances are computed by the views themselves.
// This file only reads them -- it never recomputes a badge or a variance in TypeScript.
//
// A day with nothing logged has no row here (rule #3: there is no `days` table), so this
// can return null. Callers should render an empty/no-logs state rather than synthesizing a
// zeroed status, since deriving a status badge is exactly what the view is for.
//
// Every query below is scoped to the active account -- RLS (has_account_access) now allows
// reading rows from any account you have access to, so without this filter a collaborator's
// totals would silently blend two accounts' rows together.
export async function getDailyTotals(logDate: string): Promise<DailyTotals | null> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("daily_totals")
    .select("*")
    .eq("user_id", activeAccountId)
    .eq("log_date", logDate)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// For trend charts (calories/protein/water over the last N days). Days with nothing
// logged simply have no row, same as getDailyTotals -- callers should not backfill zeros.
export async function getRecentDailyTotals(limit = 14): Promise<DailyTotals[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("daily_totals")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getWeeklyTotals(limit = 8): Promise<WeeklyTotals[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("weekly_totals")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getMonthlyTotals(limit = 12): Promise<MonthlyTotals[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("monthly_totals")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("month_start", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #6): callers chart `rolling_7d_avg` as the primary line and `weight_kg`
// (raw) as faint secondary dots -- never the other way around.
export async function getWeightProgress(limit = 90): Promise<WeightProgress[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("weight_progress")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
