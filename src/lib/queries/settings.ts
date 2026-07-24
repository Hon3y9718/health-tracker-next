import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account-context";
import type { Tables, TablesUpdate } from "@/types/database";

export type UserSettings = Tables<"user_settings">;

export async function getUserSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", activeAccountId)
    .single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #1): targets live only here. Changing one recomputes every view that
// joins against user_settings -- there is nothing else to update. A full collaborator can
// change the active account's targets too, same as any other write -- has_account_access
// already gates this at the RLS layer.
export async function updateUserSettings(
  updates: TablesUpdate<"user_settings">,
): Promise<UserSettings> {
  const supabase = await createClient();
  const activeAccountId = await getActiveAccountId();

  const { data, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", activeAccountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
