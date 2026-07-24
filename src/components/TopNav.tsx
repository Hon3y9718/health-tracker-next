import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { HomeIcon, HistoryIcon, GoalIcon } from "@/components/icons";

const iconLinkClass = "text-[var(--ink-secondary)]";

// Every non-dashboard page gets this: Back (browser history) and Home are distinct --
// Back retraces your actual path, Home always jumps to the dashboard -- plus the other
// hubs. Without this, pages like /log/meal or /settings were dead ends except for the
// browser's own back button, cumbersome on mobile where that's not always one tap away.
// Icon-only to stay subtle; page <h1> titles carry the text.
export function TopNav({
  current,
  wide,
}: {
  current?: "history" | "settings";
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full ${wide ? "max-w-2xl" : "max-w-sm"} mb-2`}
    >
      <div className="flex items-center gap-4">
        <BackButton />
        <Link href="/" aria-label="Home" title="Home" className={iconLinkClass}>
          <HomeIcon />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {current !== "history" && (
          <Link href="/history" aria-label="History" title="History" className={iconLinkClass}>
            <HistoryIcon />
          </Link>
        )}
        {current !== "settings" && (
          <Link href="/settings" aria-label="Goals" title="Goals" className={iconLinkClass}>
            <GoalIcon />
          </Link>
        )}
      </div>
    </div>
  );
}
