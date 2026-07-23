import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Meal = Tables<"meals">;

export async function getMealsForDate(logDate: string): Promise<Meal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("log_date", logDate)
    .order("eaten_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRecentMeals(limit = 10): Promise<Meal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .order("eaten_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getMealById(id: string): Promise<Meal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("meals").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #2): calories stays the only field an edit can't null out.
export async function updateMeal(id: string, input: TablesUpdate<"meals">): Promise<Meal> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #2): calories is the only required field on `input` -- every other macro
// is optional so a partially-known meal can still be logged.
export async function createMeal(
  input: Pick<TablesInsert<"meals">, "calories" | "log_date"> &
    Omit<Partial<TablesInsert<"meals">>, "calories" | "log_date" | "user_id">,
): Promise<Meal> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("meals")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}
