// Runs in the browser, before upload -- iPhone photos are routinely 3-5MB at 4032x3024.
// Resizing to a ~1600px longest side and re-encoding as JPEG gets a recognizable photo down
// to a few hundred KB, which matters a lot against Supabase Storage's free-tier quota.
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.75 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    return new File([blob], toJpgName(file.name), { type: "image/jpeg" });
  } catch {
    // Unsupported format or decode failure -- fall back to the original file rather than
    // block logging. The photo is optional; a failed compression shouldn't be a failed log.
    return file;
  }
}

function toJpgName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base || "photo"}.jpg`;
}
