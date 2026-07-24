"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SelectCheckbox } from "@/components/BulkSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditIcon, DeleteIcon } from "@/components/icons";

// Shared row shape for photo-less list entries (drinks, exercise). Tapping the row opens its
// edit page; edit/delete are 44px touch targets rather than inline text links, and delete
// always confirms first via the same hidden-form + ConfirmDialog pattern used by the photo
// cards (MealCard, WeighInCard).
export function EntryRow({
  id,
  editHref,
  deleteAction,
  confirmTitle,
  children,
}: {
  id: string;
  editHref: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  confirmTitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li
      onClick={() => router.push(editHref)}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[var(--gridline)] px-4 py-3 text-sm"
    >
      <span className="flex items-center gap-3">
        <span onClick={(e) => e.stopPropagation()}>
          <SelectCheckbox id={id} className="h-4 w-4 accent-[var(--foreground)]" />
        </span>
        {children}
      </span>
      <span className="-mr-3 flex shrink-0 items-center">
        <Link
          href={editHref}
          aria-label="Edit"
          onClick={(e) => e.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center text-[var(--ink-secondary)]"
        >
          <EditIcon />
        </Link>
        <button
          type="button"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center text-[var(--status-critical)]"
        >
          <DeleteIcon />
        </button>
      </span>

      <form ref={formRef} action={deleteAction} className="hidden">
        <input type="hidden" name="id" value={id} />
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        description="This can't be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </li>
  );
}
