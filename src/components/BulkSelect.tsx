"use client";

import { createContext, useCallback, useContext, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type BulkSelectContextValue = {
  selected: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
};

const BulkSelectContext = createContext<BulkSelectContextValue | null>(null);

// Wraps a whole list (all date groups) so every card's checkbox shares one selection set.
// Scoped to the History page only -- the quick-log pages don't need this.
export function BulkSelectProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return (
    <BulkSelectContext.Provider value={{ selected, toggle, clear }}>
      {children}
    </BulkSelectContext.Provider>
  );
}

function useBulkSelect() {
  const ctx = useContext(BulkSelectContext);
  if (!ctx) throw new Error("useBulkSelect must be used within BulkSelectProvider");
  return ctx;
}

export function SelectCheckbox({
  id,
  className = "absolute top-2 left-2 z-10 h-4 w-4 accent-[var(--foreground)]",
}: {
  id: string;
  className?: string;
}) {
  const { selected, toggle } = useBulkSelect();
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      aria-label="Select"
      className={className}
    />
  );
}

export function BulkActionBar({
  onDelete,
  itemLabel,
}: {
  onDelete: (ids: string[]) => Promise<void>;
  itemLabel: string;
}) {
  const { selected, clear } = useBulkSelect();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (selected.size === 0) return null;

  return (
    <>
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-lg border border-[var(--gridline)] bg-[var(--background)] px-4 py-3 shadow-lg">
        <span className="text-sm">{selected.size} selected</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-sm text-[var(--ink-muted)] underline underline-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
            className="rounded-md bg-[var(--status-critical)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Deleting…" : `Delete ${selected.size} ${itemLabel}`}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.size} ${itemLabel}?`}
        description="This can't be undone."
        pending={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          const ids = [...selected];
          startTransition(async () => {
            await onDelete(ids);
            clear();
            setConfirmOpen(false);
          });
        }}
      />
    </>
  );
}
