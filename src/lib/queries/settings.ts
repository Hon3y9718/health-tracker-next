import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/database";

export type UserSettings = Tables<"user_settings">;

export async function getUserSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_settings").select("*").single();

  if (error) throw error;
  return data;
}

// Rule (CLAUDE.md #1): targets live only here. Changing one recomputes every view that
// joins against user_settings -- there is nothing else to update.
export async function updateUserSettings(
  updates: TablesUpdate<"user_settings">,
): Promise<UserSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
