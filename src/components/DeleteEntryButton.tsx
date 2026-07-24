export function DeleteEntryButton({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  label?: string;
}) {
  return (
    <form action={action} className="w-full max-w-sm">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="w-full rounded-md border border-[var(--status-critical)] text-[var(--status-critical)] px-4 py-2 font-medium"
      >
        {label}
      </button>
    </form>
  );
}
