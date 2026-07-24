import { createClient } from "@/lib/supabase/server";
import {
  uploadImage,
  deleteImage,
  deleteImages,
  getSignedImageUrl,
  getSignedImageUrls,
} from "@/lib/queries/storage";
import { orIlike } from "@/lib/queries/search";
import { getActiveAccountId } from "@/lib/account-context";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Meal = Tables<"meals">;

const BUCKET = "meal-images" as const;

// Rule (CLAUDE.md #3 extended to collaborators): RLS now allows seeing every account you
// have access to (your own + any shared with you), so every list query needs an explicit
// active-account filter -- otherwise a collaborator's query would silently merge rows from
// both accounts instead of showing one account's data at a time.
export async function getMealsForDate(logDate: string): Promise<Meal[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", activeAccountId)
    .eq("log_date", logDate)
    .order("eaten_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRecentMeals(
  options: { limit?: number; date?: string; from?: string; to?: string; search?: string } = {},
): Promise<Meal[]> {
  const { limit = 10, date, from, to, search } = options;
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  let query = supabase
    .from("meals")
    .select("*")
    .eq("user_id", activeAccountId)
    .order("eaten_at", { ascending: false });

  if (date) query = query.eq("log_date", date);
  else if (from || to) {
    if (from) query = query.gte("log_date", from);
    if (to) query = query.lte("log_date", to);
  }
  if (search) query = query.or(orIlike(["title", "meal_label", "notes"], search));

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

// Full, unbounded history for data export -- PostgREST caps any single response at
// max_rows (1000, see supabase/config.toml), so this pages through in batches rather than
// silently truncating a year+ of logs.
export async function getAllMeals(): Promise<Meal[]> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const pageSize = 1000;
  const all: Meal[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("meals")
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

// Fetched by id, not listed -- RLS (has_account_access) is the right scope here, not the
// active account, since a direct link should work regardless of which account you're
// currently switched into.
export async function getMealById(id: string): Promise<Meal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("meals").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data;
}

// Photo is optional and recommended, never required -- same shape as rule #2.
export async function getMealImageUrl(meal: Meal): Promise<string | null> {
  if (!meal.image_path) return null;
  return getSignedImageUrl(BUCKET, meal.image_path);
}

// For list/card views: one Storage API call for every meal's photo instead of one per meal.
export async function getMealImageUrls(meals: Meal[]): Promise<Map<string, string>> {
  const paths = meals.flatMap((m) => (m.image_path ? [m.image_path] : []));
  const byPath = await getSignedImageUrls(BUCKET, paths);

  const byMealId = new Map<string, string>();
  for (const meal of meals) {
    if (meal.image_path) {
      const url = byPath.get(meal.image_path);
      if (url) byMealId.set(meal.id, url);
    }
  }
  return byMealId;
}

export type ImageAction = { type: "keep" } | { type: "replace"; file: File } | { type: "remove" };

// Rule (CLAUDE.md #2): calories stays the only field an edit can't null out.
export async function updateMeal(
  id: string,
  input: TablesUpdate<"meals">,
  imageAction: ImageAction = { type: "keep" },
): Promise<Meal> {
  const supabase = await createClient();

  let imagePatch: { image_path: string | null } | Record<string, never> = {};
  if (imageAction.type !== "keep") {
    const existing = await getMealById(id);
    if (existing?.image_path) {
      await deleteImage(BUCKET, existing.image_path).catch(() => {});
    }
    // Use the meal's own owner, not the active account -- a direct edit link should upload
    // to the account the meal actually belongs to even if that's not what's switched-to.
    const image_path =
      imageAction.type === "replace" && existing
        ? await uploadImage(BUCKET, imageAction.file, existing.user_id)
        : null;
    imagePatch = { image_path };
  }

  const { data, error } = await supabase
    .from("meals")
    .update({ ...input, ...imagePatch })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #2): calories is the only required field on `input` -- every other macro
// (and the photo) is optional so a partially-known meal can still be logged.
export async function createMeal(
  input: Pick<TablesInsert<"meals">, "calories" | "log_date"> &
    Omit<Partial<TablesInsert<"meals">>, "calories" | "log_date" | "user_id" | "image_path">,
  image?: File | null,
): Promise<Meal> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();

  const image_path =
    image && image.size > 0 ? await uploadImage(BUCKET, image, activeAccountId) : null;

  const { data, error } = await supabase
    .from("meals")
    .insert({ ...input, image_path, user_id: activeAccountId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeal(id: string): Promise<void> {
  const supabase = await createClient();
  const existing = await getMealById(id);
  if (existing?.image_path) {
    await deleteImage(BUCKET, existing.image_path).catch(() => {});
  }
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}

// One Storage call for all photos being removed, one DB call for all rows, instead of N of each.
export async function bulkDeleteMeals(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createClient();

  const { data: rows, error: fetchError } = await supabase
    .from("meals")
    .select("image_path")
    .in("id", ids);
  if (fetchError) throw fetchError;

  const paths = rows.flatMap((r) => (r.image_path ? [r.image_path] : []));
  await deleteImages(BUCKET, paths).catch(() => {});

  const { error } = await supabase.from("meals").delete().in("id", ids);
  if (error) throw error;
}
