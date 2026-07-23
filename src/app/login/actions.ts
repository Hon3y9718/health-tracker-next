"use server";

import { redirect } from "next/navigation";
import { signInWithPassword } from "@/lib/queries/auth";

export type LoginState = { error?: string } | undefined;

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signInWithPassword(email, password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not sign in." };
  }

  redirect("/");
}
