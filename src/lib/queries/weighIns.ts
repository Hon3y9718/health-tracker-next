import { createClient } from "@/lib/supabase/server";
import { deleteAllWeighInImages, deleteAllWeighInImagesForIds } from "@/lib/queries/weighInImages";
import { getActiveAccountId } from "@/lib/account-context";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type WeighIn = Tables<"weigh_ins">;

export async function getRecentWeighIns(
  options: { limit?: number; date?: string; from?: string; to?: string } = {},
): Promise<WeighIn[]> {
  const { limit = 90, date, from, to } = options;
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  let query = supabase
    .from("weigh_ins")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("log_date", { ascending: false });

  if (date) query = query.eq("log_date", date);
  else if (from || to) {
    if (from) query = query.gte("log_date", from);
    if (to) query = query.lte("log_date", to);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

// Full, unbounded history for data export -- see meals.ts's getAllMeals for why this pages
// through max_rows batches instead of a single unlimited select.
export async function getAllWeighIns(): Promise<WeighIn[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const pageSize = 1000;
  const all: WeighIn[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("weigh_ins")
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

export async function updateWeighIn(id: string, input: TablesUpdate<"weigh_ins">): Promise<WeighIn> {
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
// same day. Photos (front/side) are handled separately via lib/queries/weighInImages.ts --
// a weigh-in can be created before any photo exists.
export async function createWeighIn(
  input: Pick<TablesInsert<"weigh_ins">, "weight_kg" | "log_date"> &
    Omit<Partial<TablesInsert<"weigh_ins">>, "weight_kg" | "log_date" | "user_id">,
): Promise<WeighIn> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();

  const { data, error } = await supabase
    .from("weigh_ins")
    .insert({ ...input, user_id: activeAccountId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeighIn(id: string): Promise<void> {
  // Storage objects have to be cleaned up explicitly before the row goes away -- the FK's
  // ON DELETE CASCADE only removes the weigh_in_images rows, not their files in Storage.
  await deleteAllWeighInImages(id);
  const supabase = await createClient();
  const { error } = await supabase.from("weigh_ins").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteWeighIns(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await deleteAllWeighInImagesForIds(ids);
  const supabase = await createClient();
  const { error } = await supabase.from("weigh_ins").delete().in("id", ids);
  if (error) throw error;
}
