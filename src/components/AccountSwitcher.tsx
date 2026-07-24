"use client";

import { useRef } from "react";
import { switchAccountAction } from "@/app/actions/switchAccount";
import { SwitchIcon } from "@/components/icons";
import type { AccessibleAccount } from "@/lib/account-context";

// Only rendered when there's more than one account to choose from (see callers). RLS is
// the real access boundary -- this just lets a collaborator pick which account's data the
// rest of the app should read/write for the rest of the session.
export function AccountSwitcher({
  accounts,
  activeId,
}: {
  accounts: AccessibleAccount[];
  activeId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={switchAccountAction} className="flex items-center gap-1.5">
      <SwitchIcon className="w-4 h-4 text-[var(--ink-secondary)]" />
      <select
        name="account_id"
        defaultValue={activeId}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Switch account"
        className="rounded-md border border-[var(--gridline)] bg-transparent px-2 py-1 text-xs text-[var(--ink-secondary)]"
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.isOwn ? "My account" : account.email}
          </option>
        ))}
      </select>
    </form>
  );
}
