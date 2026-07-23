import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Drink = Tables<"drinks">;

export async function getDrinksForDate(logDate: string): Promise<Drink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("log_date", logDate)
    .order("drunk_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRecentDrinks(limit = 10): Promise<Drink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .order("drunk_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("drinks")
    .insert({ ...input, user_id: user.id })
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
