import { logout } from "@/app/actions/logout";
import { LogoutIcon } from "@/components/icons";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="text-[var(--ink-secondary)]"
      >
        <LogoutIcon />
      </button>
    </form>
  );
}
