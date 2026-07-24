"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Debounced instant search: typing updates the URL (and thus the server-rendered results)
// after a short pause, no explicit submit needed. Still a real named form field (`name="q"`)
// so clicking the surrounding form's "Filter" button (e.g. after also changing the date)
// submits the current search text together with it in one native GET, rather than losing it.
export function SearchBox({ tab, defaultValue }: { tab: string; defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      if (value) params.set("q", value);
      else params.delete("q");
      router.push(`/history?${params.toString()}`);
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      id="q"
      type="text"
      name="q"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search…"
      className="rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2 text-sm w-full"
    />
  );
}
