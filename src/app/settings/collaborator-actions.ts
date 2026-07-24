"use server";

import { revalidatePath } from "next/cache";
import {
  inviteCollaborator,
  revokeCollaborator,
  leaveSharedAccount,
} from "@/lib/queries/collaborators";

export type InviteCollaboratorState = { error?: string; success?: string } | undefined;

export async function inviteCollaboratorAction(
  _state: InviteCollaboratorState,
  formData: FormData,
): Promise<InviteCollaboratorState> {
  const email = String(formData.get("email") ?? "");
  const result = await inviteCollaborator(email);
  if (result.error) return { error: result.error };

  revalidatePath("/settings");
  return { success: `${email} now has access to your account.` };
}

export async function revokeCollaboratorAction(formData: FormData): Promise<void> {
  const linkId = String(formData.get("link_id") ?? "");
  if (!linkId) return;
  await revokeCollaborator(linkId);
  revalidatePath("/settings");
}

// Leaving also drops you from that account if it's the one currently active -- switchAccount
// falls back to "my own account" on its own once the link is gone (see account-context.ts).
export async function leaveSharedAccountAction(formData: FormData): Promise<void> {
  const linkId = String(formData.get("link_id") ?? "");
  if (!linkId) return;
  await leaveSharedAccount(linkId);
  revalidatePath("/settings");
  revalidatePath("/");
}
