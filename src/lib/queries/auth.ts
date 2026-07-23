import { createClient } from "@/lib/supabase/server";

export async function signUpWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Supabase hosted projects default to requiring email confirmation, in which case
  // signUp succeeds but returns no session yet -- callers need to know which happened.
  return { emailConfirmationRequired: data.session === null };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
