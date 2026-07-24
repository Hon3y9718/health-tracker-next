"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/icons";

// Distinct from Home: goes back one step in browser history rather than always to the
// dashboard. Client-only since router.back() needs the History API.
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Back"
      title="Back"
      className="text-[var(--ink-secondary)]"
    >
      <BackIcon />
    </button>
  );
}
