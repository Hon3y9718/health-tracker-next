// Rendered automatically by Next.js's loading.tsx convention while a route segment's data
// fetches -- no manual pending-state wiring needed for page-level loads.
export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--gridline)] border-t-[var(--foreground)]"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
