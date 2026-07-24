import { createClient } from "@/lib/supabase/server";
import {
  uploadImage,
  deleteImage,
  deleteImages,
  getSignedImageUrl,
  getSignedImageUrls,
} from "@/lib/queries/storage";
import type { Tables } from "@/types/database";

export type WeighInImage = Tables<"weigh_in_images">;

const BUCKET = "body-images" as const;

// For list/card views showing several weigh-ins at once: one query instead of one per row.
export async function getWeighInImagesForIds(
  weighInIds: string[],
): Promise<Map<string, WeighInImage[]>> {
  const map = new Map<string, WeighInImage[]>();
  if (weighInIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weigh_in_images")
    .select("*")
    .in("weigh_in_id", weighInIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  for (const image of data) {
    const existing = map.get(image.weigh_in_id);
    if (existing) existing.push(image);
    else map.set(image.weigh_in_id, [image]);
  }
  return map;
}

export async function getWeighInImages(weighInId: string): Promise<WeighInImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weigh_in_images")
    .select("*")
    .eq("weigh_in_id", weighInId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Buckets are private -- only called when a detail page actually renders an image.
export async function getWeighInImageUrl(image: WeighInImage): Promise<string> {
  return getSignedImageUrl(BUCKET, image.image_path);
}

// For list/card views: one Storage API call for every image across all rows, keyed by each
// image's own id, instead of one call per image.
export async function getWeighInImageUrlsByImageId(
  images: WeighInImage[],
): Promise<Map<string, string>> {
  const byPath = await getSignedImageUrls(
    BUCKET,
    images.map((img) => img.image_path),
  );

  const byImageId = new Map<string, string>();
  for (const image of images) {
    const url = byPath.get(image.image_path);
    if (url) byImageId.set(image.id, url);
  }
  return byImageId;
}

// ownerId is the weigh-in's own owner (not necessarily whoever is logged in), so a
// collaborator adding a photo to someone else's weigh-in files it under the right account's
// Storage folder and row -- see the same reasoning in lib/queries/storage.ts.
export async function addWeighInImage(
  weighInId: string,
  file: File,
  label: string | null,
  ownerId: string,
): Promise<WeighInImage> {
  const supabase = await createClient();
  const image_path = await uploadImage(BUCKET, file, ownerId);

  const { data, error } = await supabase
    .from("weigh_in_images")
    .insert({ weigh_in_id: weighInId, user_id: ownerId, label, image_path })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeighInImage(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: image, error: fetchError } = await supabase
    .from("weigh_in_images")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (image) {
    await deleteImage(BUCKET, image.image_path).catch(() => {});
  }
  const { error } = await supabase.from("weigh_in_images").delete().eq("id", id);
  if (error) throw error;
}

// Each label (e.g. "Front", "Side") holds at most one image at a time -- uploading a new
// one for a label that already has an image replaces it rather than appending a duplicate.
export async function replaceWeighInImageByLabel(
  weighInId: string,
  label: string,
  file: File,
  ownerId: string,
): Promise<WeighInImage> {
  const existing = await getWeighInImages(weighInId);
  const match = existing.find((img) => img.label === label);
  if (match) {
    await deleteWeighInImage(match.id);
  }
  return addWeighInImage(weighInId, file, label, ownerId);
}

export async function removeWeighInImageByLabel(weighInId: string, label: string): Promise<void> {
  const existing = await getWeighInImages(weighInId);
  const match = existing.find((img) => img.label === label);
  if (match) {
    await deleteWeighInImage(match.id);
  }
}

// Called from deleteWeighIn: the FK's ON DELETE CASCADE removes these rows automatically
// once the weigh_in row is deleted, but it can't reach into Storage -- this cleans up the
// actual files first, while the rows (and thus their paths) are still queryable.
export async function deleteAllWeighInImages(weighInId: string): Promise<void> {
  const images = await getWeighInImages(weighInId);
  const paths = images.map((img) => img.image_path);
  await deleteImages(BUCKET, paths).catch(() => {});
}

// Bulk version: one query for all images across all weigh-ins, one Storage call to remove
// them, instead of per-weigh-in round trips.
export async function deleteAllWeighInImagesForIds(weighInIds: string[]): Promise<void> {
  if (weighInIds.length === 0) return;
  const imagesByWeighIn = await getWeighInImagesForIds(weighInIds);
  const paths = [...imagesByWeighIn.values()].flat().map((img) => img.image_path);
  await deleteImages(BUCKET, paths).catch(() => {});
}
