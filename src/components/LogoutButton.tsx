import { logout } from "@/app/actions/logout";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-[var(--ink-secondary)] underline underline-offset-2"
      >
        Sign out
      </button>
    </form>
  );
}
