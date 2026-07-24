"use client";

import { useEffect, useRef } from "react";

// Generic yes/no gate for destructive actions -- delete anywhere in the app should go
// through this rather than firing on a single tap/click. Click on the backdrop or Escape
// cancels; every click inside is stopped from bubbling so callers can nest this in a
// clickable card without triggering the card's own onClick.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-[var(--gridline)] bg-[var(--background)] p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{title}</span>
          {description && (
            <span className="text-sm text-[var(--ink-muted)]">{description}</span>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-11 items-center rounded-md px-4 text-sm text-[var(--ink-secondary)]"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="flex min-h-11 items-center rounded-md bg-[var(--status-critical)] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
