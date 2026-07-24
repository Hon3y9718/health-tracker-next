// Runs in the browser, before upload -- iPhone photos are routinely 3-5MB at 4032x3024.
// Resizing to a ~1600px longest side and re-encoding as JPEG gets a recognizable photo down
// to a few hundred KB, which matters a lot against Supabase Storage's free-tier quota and
// against the Server Action body size limit (see next.config.ts).
//
// HEIC/HEIF (the default format for iPhone camera/gallery photos) can't be decoded by
// createImageBitmap in most non-Safari browsers, and Android's file picker sometimes hands
// back a HEIC file with an empty MIME type. heic-to bundles a current libheif build (unlike
// the unmaintained heic2any, whose old bundled decoder fails on newer iPhone HEIC variants
// with "Could not parse HEIF file") and is only imported when a file looks like HEIC, since
// its wasm payload is a few MB.
const HEIC_EXTENSION_RE = /\.(heic|heif)$/i;

function looksLikeHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  return type === "image/heic" || type === "image/heif" || HEIC_EXTENSION_RE.test(file.name);
}

export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.75 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  let bitmap: ImageBitmap;

  if (looksLikeHeic(file)) {
    const { heicTo, isHeic } = await import("heic-to");
    // Extension/MIME can lie (Android sometimes reports an empty type) -- confirm against
    // the actual file signature before paying for a HEIC decode.
    bitmap = (await isHeic(file)) ? await heicTo({ blob: file, type: "bitmap" }) : await createImageBitmap(file);
  } else {
    bitmap = await createImageBitmap(file);
  }

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new Error("Failed to encode compressed image");

  return new File([blob], toJpgName(file.name), { type: "image/jpeg" });
}

function toJpgName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base || "photo"}.jpg`;
}
