"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WeighIn } from "@/lib/queries/weighIns";
import { deleteWeighInAction } from "@/app/log/weight/actions";
import { SelectCheckbox } from "@/components/BulkSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditIcon, DeleteIcon } from "@/components/icons";

export function WeighInCard({
  weighIn,
  frontUrl,
  sideUrl,
}: {
  weighIn: WeighIn;
  frontUrl: string | undefined;
  sideUrl: string | undefined;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const editHref = `/log/weight/${weighIn.id}`;

  return (
    <li
      onClick={() => router.push(editHref)}
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-[var(--gridline)]"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SelectCheckbox id={weighIn.id} />
      </div>

      {(frontUrl || sideUrl) && (
        <div className="flex">
          {frontUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
            <img src={frontUrl} alt="Front" className="flex-1 aspect-square object-cover" />
          )}
          {sideUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
            <img src={sideUrl} alt="Side" className="flex-1 aspect-square object-cover" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1 p-3">
        <span className="text-sm font-medium">{weighIn.weight_kg}kg</span>
        <div className="-ml-3 mt-1 flex items-center">
          <Link
            href={editHref}
            aria-label="Edit weigh-in"
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 w-11 items-center justify-center text-[var(--ink-secondary)]"
          >
            <EditIcon />
          </Link>
          <button
            type="button"
            aria-label="Delete weigh-in"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="flex h-11 w-11 items-center justify-center text-[var(--status-critical)]"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <form ref={formRef} action={deleteWeighInAction} className="hidden">
        <input type="hidden" name="id" value={weighIn.id} />
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this weigh-in?"
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
