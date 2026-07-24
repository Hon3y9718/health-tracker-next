"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { compressImage } from "@/lib/image-compression";

// Shared by MealForm and WeightForm. Photo is optional and recommended, never required.
//
// Only `hiddenInputRef` is a named form field -- it's never opened directly by the user.
// The drag-drop zone (desktop) and the camera/gallery buttons (mobile) each drive their own
// unnamed <input>, and on pick/drop the file is compressed and injected into the hidden
// input via DataTransfer, so the surrounding <form>'s native submission (and the existing
// useActionState/Server Action wiring) needs no changes to pick it up. Keeping a single named
// field also avoids duplicate `formData.get(name)` entries from multiple file inputs.
const PICKER_ACCEPT = "image/*,.heic,.heif";

export function ImageField({
  name,
  removeFieldName,
  existingImageUrl,
  label = "Photo",
}: {
  name: string;
  removeFieldName: string;
  existingImageUrl?: string | null;
  label?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
  const [removed, setRemoved] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  async function processFile(file: File) {
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressed);
      if (hiddenInputRef.current) hiddenInputRef.current.files = dataTransfer.files;
      setPreviewUrl(URL.createObjectURL(compressed));
      setRemoved(false);
    } catch {
      // Photo is optional -- a failed conversion/compression shouldn't block logging.
      // Leave whatever was previously attached (or nothing) rather than uploading a raw,
      // possibly huge or undecodable file.
      setError("Couldn't process that photo — try a different one.");
    } finally {
      setCompressing(false);
    }
  }

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  function handleRemove(checked: boolean) {
    setRemoved(checked);
    setError(null);
    if (checked) {
      setPreviewUrl(null);
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
    } else {
      setPreviewUrl(existingImageUrl ?? null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-[var(--ink-secondary)]">
        {label} <span className="text-[var(--ink-muted)]">— optional, recommended</span>
      </label>

      {previewUrl && !removed && (
        // eslint-disable-next-line @next/next/no-img-element -- object/blob/signed URLs, not a static asset
        <img
          src={previewUrl}
          alt=""
          className="w-full max-w-[240px] rounded-md object-cover border border-[var(--gridline)]"
        />
      )}

      <input ref={hiddenInputRef} type="file" name={name} className="hidden" />

      {/* Desktop: drag-and-drop zone, click to browse */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => browseRef.current?.click()}
        className="hidden md:flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-6 text-sm cursor-pointer transition-colors"
        style={{
          borderColor: dragActive ? "var(--series-primary)" : "var(--gridline)",
          color: "var(--ink-muted)",
          backgroundColor: dragActive ? "color-mix(in srgb, var(--series-primary) 8%, transparent)" : "transparent",
        }}
      >
        <span>Drag and drop a photo here, or click to browse</span>
        <input
          ref={browseRef}
          type="file"
          accept={PICKER_ACCEPT}
          onChange={handlePick}
          className="hidden"
        />
      </div>

      {/* Mobile: explicit camera vs gallery choice -- a plain accept="image/*" input with
          capture="environment" launches the camera directly on most mobile browsers,
          skipping the photo library entirely, so picking from the gallery needs its own
          uncaptured input. */}
      <div className="flex md:hidden gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex-1 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          Take photo
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex-1 rounded-md border border-[var(--gridline)] px-3 py-2 text-sm"
        >
          Choose from gallery
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePick}
          className="hidden"
        />
        <input
          ref={galleryRef}
          type="file"
          accept={PICKER_ACCEPT}
          onChange={handlePick}
          className="hidden"
        />
      </div>

      {compressing && <span className="text-xs text-[var(--ink-muted)]">Compressing…</span>}
      {error && <span className="text-xs text-[var(--status-critical)]">{error}</span>}

      {existingImageUrl && (
        <label className="flex items-center gap-2 text-sm text-[var(--status-critical)]">
          <input
            type="checkbox"
            name={removeFieldName}
            value="true"
            checked={removed}
            onChange={(e) => handleRemove(e.target.checked)}
          />
          Remove photo
        </label>
      )}
    </div>
  );
}
