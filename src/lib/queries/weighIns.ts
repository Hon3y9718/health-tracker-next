import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type WeighIn = Tables<"weigh_ins">;

export async function getRecentWeighIns(limit = 90): Promise<WeighIn[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weigh_ins")
    .select("*")
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getWeighInById(id: string): Promise<WeighIn | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weigh_ins")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateWeighIn(
  id: string,
  input: TablesUpdate<"weigh_ins">,
): Promise<WeighIn> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weigh_ins")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #3): logging a weigh-in never depends on a meal or drink existing for the
// same day.
export async function createWeighIn(
  input: Pick<TablesInsert<"weigh_ins">, "weight_kg" | "log_date"> &
    Omit<Partial<TablesInsert<"weigh_ins">>, "weight_kg" | "log_date" | "user_id">,
): Promise<WeighIn> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("weigh_ins")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeighIn(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("weigh_ins").delete().eq("id", id);
  if (error) throw error;
}
