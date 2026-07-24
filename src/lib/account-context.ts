import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "active_account_id";

// The account currently being acted on -- defaults to the logged-in user's own id. A
// collaborator can switch this to any owner who has granted them access (account_links).
// RLS (has_account_access) is the real security boundary; this cookie is only a UI routing
// hint, so a stale/invalid value (e.g. access was since revoked) just falls back to "my own
// account" rather than being a security concern.
export async function getActiveAccountId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const cookieStore = await cookies();
  const active = cookieStore.get(COOKIE_NAME)?.value;
  if (!active || active === user.id) return user.id;

  const { data } = await supabase
    .from("account_links")
    .select("owner_id")
    .eq("owner_id", active)
    .eq("collaborator_id", user.id)
    .maybeSingle();

  return data ? active : user.id;
}

export async function setActiveAccountId(accountId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveAccountId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export type AccessibleAccount = {
  id: string;
  email: string;
  isOwn: boolean;
};

// For the account switcher: your own account plus every account shared with you.
export async function getAccessibleAccounts(): Promise<AccessibleAccount[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: shared, error } = await supabase.rpc("list_accounts_shared_with_me");
  if (error) throw error;

  return [
    { id: user.id, email: user.email ?? "", isOwn: true },
    ...shared.map((s) => ({ id: s.owner_id, email: s.owner_email ?? "", isOwn: false })),
  ];
}
