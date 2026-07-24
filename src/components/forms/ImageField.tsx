"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compression";

// Shared by MealForm and WeightForm. Photo is optional and recommended, never required.
// Compression happens the moment a file is picked -- the compressed File replaces the
// input's file list via DataTransfer, so the surrounding <form>'s native submission (and
// the existing useActionState/Server Action wiring) needs no changes to pick it up.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
  const [removed, setRemoved] = useState(false);
  const [compressing, setCompressing] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setRemoved(false);
    const compressed = await compressImage(file);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressed);
    if (inputRef.current) inputRef.current.files = dataTransfer.files;

    setPreviewUrl(URL.createObjectURL(compressed));
    setCompressing(false);
  }

  function handleRemove(checked: boolean) {
    setRemoved(checked);
    if (checked) {
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = "";
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

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="text-sm"
        />
        {compressing && <span className="text-xs text-[var(--ink-muted)]">Compressing…</span>}
      </div>

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
