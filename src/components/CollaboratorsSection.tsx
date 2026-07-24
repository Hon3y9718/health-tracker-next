"use client";

import { useActionState } from "react";
import {
  inviteCollaboratorAction,
  revokeCollaboratorAction,
  leaveSharedAccountAction,
} from "@/app/settings/collaborator-actions";
import { switchAccountAction } from "@/app/actions/switchAccount";
import type { Collaborator, SharedAccount } from "@/lib/queries/collaborators";

const rowClass =
  "flex items-center justify-between rounded-md border border-[var(--gridline)] px-3 py-2 text-sm";
const dangerLinkClass = "text-xs text-[var(--status-critical)]";

// Always about the real logged-in identity, never the active account -- see
// lib/queries/collaborators.ts. Switching which account you're acting on happens via
// AccountSwitcher (or the "Switch to" buttons below); managing who can act on *your* own
// account is a separate concern from that.
export function CollaboratorsSection({
  collaborators,
  sharedAccounts,
  activeAccountId,
}: {
  collaborators: Collaborator[];
  sharedAccounts: SharedAccount[];
  activeAccountId: string;
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteCollaboratorAction,
    undefined,
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">People with access to your account</h2>

        {collaborators.length === 0 ? (
          <p className="text-xs text-[var(--ink-muted)]">No one else has access yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {collaborators.map((c) => (
              <li key={c.linkId} className={rowClass}>
                <span>{c.email}</span>
                <form action={revokeCollaboratorAction}>
                  <input type="hidden" name="link_id" value={c.linkId} />
                  <button type="submit" className={dangerLinkClass}>
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={inviteAction} className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="their@email.com"
            required
            className="flex-1 rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={invitePending}
            className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {invitePending ? "Adding…" : "Add"}
          </button>
        </form>
        {inviteState?.error && (
          <p className="text-xs text-[var(--status-critical)]">{inviteState.error}</p>
        )}
        {inviteState?.success && (
          <p className="text-xs text-[var(--ink-secondary)]">{inviteState.success}</p>
        )}
        <p className="text-xs text-[var(--ink-muted)]">
          They get full read/write access to your meals, drinks, weigh-ins and exercises — the
          same as you. They need an existing account with that email.
        </p>
      </section>

      {sharedAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Accounts shared with you</h2>
          <ul className="flex flex-col gap-2">
            {sharedAccounts.map((s) => (
              <li key={s.linkId} className={rowClass}>
                <span>{s.email}</span>
                <div className="flex items-center gap-3">
                  {activeAccountId !== s.ownerId && (
                    <form action={switchAccountAction}>
                      <input type="hidden" name="account_id" value={s.ownerId} />
                      <button type="submit" className="text-xs text-[var(--ink-secondary)]">
                        Switch to
                      </button>
                    </form>
                  )}
                  <form action={leaveSharedAccountAction}>
                    <input type="hidden" name="link_id" value={s.linkId} />
                    <button type="submit" className={dangerLinkClass}>
                      Leave
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
