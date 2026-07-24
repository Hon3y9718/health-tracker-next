import { getDailyInsight } from "@/lib/insight";

// Async server component rendered inside a Suspense boundary (see app/page.tsx) so an
// uncached Gemini call streams in after the rest of the dashboard, rather than blocking it.
export async function DailyInsight() {
  const text = await getDailyInsight();
  return (
    <p className="text-sm text-[var(--ink-secondary)] rounded-lg border border-[var(--gridline)] px-4 py-3">
      {text}
    </p>
  );
}

export function DailyInsightSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--gridline)] px-4 py-3">
      <div className="h-4 w-2/3 rounded bg-[var(--gridline)] animate-pulse" />
    </div>
  );
}
