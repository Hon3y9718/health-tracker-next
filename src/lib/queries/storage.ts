import { createClient } from "@/lib/supabase/server";

export type ImageBucket = "meal-images" | "body-images";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Objects are stored at "<user_id>/<uuid>.<ext>" -- bucket RLS policies (see
// storage_buckets migration) enforce that a user can only read/write their own folder.
export async function uploadImage(bucket: ImageBucket, file: File): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = EXTENSION_BY_MIME[file.type] ?? "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteImage(bucket: ImageBucket, path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// Bulk delete: one Storage API call for every path being removed instead of one per image.
export async function deleteImages(bucket: ImageBucket, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

// Buckets are private -- this is only ever called when a detail page actually renders an
// image, not on list views or the dashboard, so a photo's bytes are never fetched unless
// someone is actually looking at it.
export async function getSignedImageUrl(
  bucket: ImageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

// For list/card views showing several images at once: one Storage API call for every path
// instead of one call per image. Supabase's createSignedUrls (plural) does exactly this.
export async function getSignedImageUrls(
  bucket: ImageBucket,
  paths: string[],
  expiresInSeconds = 3600,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresInSeconds);
  if (error) throw error;

  for (const entry of data) {
    if (entry.signedUrl && !entry.error) map.set(entry.path ?? "", entry.signedUrl);
  }
  return map;
}
