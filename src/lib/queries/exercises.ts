import { createClient } from "@/lib/supabase/server";
import { orIlike } from "@/lib/queries/search";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Exercise = Tables<"exercises">;
export type ExerciseDay = Tables<"exercise_days">;

export async function getRecentExercises(
  options: { limit?: number; date?: string; from?: string; to?: string; search?: string } = {},
): Promise<Exercise[]> {
  const { limit = 10, date, from, to, search } = options;
  const supabase = await createClient();
  let query = supabase.from("exercises").select("*").order("logged_at", { ascending: false });

  if (date) query = query.eq("log_date", date);
  else if (from || to) {
    if (from) query = query.gte("log_date", from);
    if (to) query = query.lte("log_date", to);
  }
  if (search) query = query.or(orIlike(["exercise_type", "notes"], search));

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateExercise(
  id: string,
  input: TablesUpdate<"exercises">,
): Promise<Exercise> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #3): exercise logging never depends on a meal, drink, or weigh-in
// existing for the same day.
export async function createExercise(
  input: Pick<TablesInsert<"exercises">, "exercise_type" | "log_date"> &
    Omit<Partial<TablesInsert<"exercises">>, "exercise_type" | "log_date" | "user_id">,
): Promise<Exercise> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("exercises")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteExercises(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().in("id", ids);
  if (error) throw error;
}

// Backs the activity heatmap. Deliberately returns per-day facts only (session_count,
// exercise_types) -- never a computed streak length (see exercise_days_view migration).
export async function getExerciseDays(daysBack = 371): Promise<ExerciseDay[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const sinceDate = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("exercise_days")
    .select("*")
    .gte("log_date", sinceDate)
    .order("log_date", { ascending: true });

  if (error) throw error;
  return data;
}
