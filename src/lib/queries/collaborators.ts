import { createClient } from "@/lib/supabase/server";

export type Collaborator = {
  linkId: string;
  collaboratorId: string;
  email: string;
  createdAt: string;
};

export type SharedAccount = {
  linkId: string;
  ownerId: string;
  email: string;
  createdAt: string;
};

// People you've granted access to your own account -- always scoped to the real logged-in
// user (auth.uid()), never the "active account", since only the true owner can manage who
// has access to their account (RLS enforces this too: insert requires auth.uid() = owner_id).
export async function listMyCollaborators(): Promise<Collaborator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_collaborators");
  if (error) throw error;
  return data.map((row) => ({
    linkId: row.link_id,
    collaboratorId: row.collaborator_id,
    email: row.collaborator_email,
    createdAt: row.created_at,
  }));
}

// Accounts other people have shared with you.
export async function listAccountsSharedWithMe(): Promise<SharedAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_accounts_shared_with_me");
  if (error) throw error;
  return data.map((row) => ({
    linkId: row.link_id,
    ownerId: row.owner_id,
    email: row.owner_email,
    createdAt: row.created_at,
  }));
}

export type InviteResult = { error?: string };

export async function inviteCollaborator(email: string): Promise<InviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { error: "Email is required." };

  if (trimmedEmail.toLowerCase() === (user.email ?? "").toLowerCase()) {
    return { error: "You can't add yourself." };
  }

  const { data: foundId, error: lookupError } = await supabase.rpc("find_user_id_by_email", {
    lookup_email: trimmedEmail,
  });
  if (lookupError) return { error: lookupError.message };
  if (!foundId) {
    return { error: "No account found with that email. They need to sign up first." };
  }

  const { error: insertError } = await supabase
    .from("account_links")
    .insert({ owner_id: user.id, collaborator_id: foundId });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "That person already has access." };
    }
    return { error: insertError.message };
  }

  return {};
}

export async function revokeCollaborator(linkId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("account_links").delete().eq("id", linkId);
  if (error) throw error;
}

export async function leaveSharedAccount(linkId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("account_links").delete().eq("id", linkId);
  if (error) throw error;
}
