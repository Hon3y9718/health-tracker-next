import { createClient } from "@/lib/supabase/server";
import {
  uploadImage,
  deleteImage,
  deleteImages,
  getSignedImageUrl,
  getSignedImageUrls,
} from "@/lib/queries/storage";
import { orIlike } from "@/lib/queries/search";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Meal = Tables<"meals">;

const BUCKET = "meal-images" as const;

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

export async function getRecentMeals(
  options: { limit?: number; date?: string; from?: string; to?: string; search?: string } = {},
): Promise<Meal[]> {
  const { limit = 10, date, from, to, search } = options;
  const supabase = await createClient();
  let query = supabase.from("meals").select("*").order("eaten_at", { ascending: false });

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
    const image_path =
      imageAction.type === "replace" ? await uploadImage(BUCKET, imageAction.file) : null;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const image_path = image && image.size > 0 ? await uploadImage(BUCKET, image) : null;

  const { data, error } = await supabase
    .from("meals")
    .insert({ ...input, image_path, user_id: user.id })
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
