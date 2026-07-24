import { createClient } from "@/lib/supabase/server";
import { orIlike } from "@/lib/queries/search";
import { getActiveAccountId } from "@/lib/account-context";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Drink = Tables<"drinks">;

export async function getDrinksForDate(logDate: string): Promise<Drink[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("user_id", activeAccountId)
    .eq("log_date", logDate)
    .order("drunk_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRecentDrinks(
  options: { limit?: number; date?: string; from?: string; to?: string; search?: string } = {},
): Promise<Drink[]> {
  const { limit = 10, date, from, to, search } = options;
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  let query = supabase
    .from("drinks")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("drunk_at", { ascending: false });

  if (date) query = query.eq("log_date", date);
  else if (from || to) {
    if (from) query = query.gte("log_date", from);
    if (to) query = query.lte("log_date", to);
  }
  if (search) query = query.or(orIlike(["drink_type"], search));

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

// Full, unbounded history for data export -- see getAllMeals for why this pages through
// max_rows batches instead of a single unlimited select.
export async function getAllDrinks(): Promise<Drink[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const pageSize = 1000;
  const all: Drink[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("user_id", activeAccountId)
      .order("log_date", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    all.push(...data);
    if (data.length < pageSize) break;
  }
  return all;
}

export async function getDrinkById(id: string): Promise<Drink | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drinks").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateDrink(id: string, input: TablesUpdate<"drinks">): Promise<Drink> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drinks")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #3): logging water never depends on a meal existing for the same day.
export async function createDrink(
  input: Pick<TablesInsert<"drinks">, "amount_l" | "log_date"> &
    Omit<Partial<TablesInsert<"drinks">>, "amount_l" | "log_date" | "user_id">,
): Promise<Drink> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();

  const { data, error } = await supabase
    .from("drinks")
    .insert({ ...input, user_id: activeAccountId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDrink(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("drinks").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteDrinks(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("drinks").delete().in("id", ids);
  if (error) throw error;
}
