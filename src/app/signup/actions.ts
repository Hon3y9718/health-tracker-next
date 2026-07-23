"use server";

import { redirect } from "next/navigation";
import { signUpWithPassword } from "@/lib/queries/auth";

export type SignupState = { error?: string; checkEmail?: boolean } | undefined;

export async function signup(
  _state: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let emailConfirmationRequired: boolean;
  try {
    ({ emailConfirmationRequired } = await signUpWithPassword(email, password));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not sign up." };
  }

  if (emailConfirmationRequired) {
    return { checkEmail: true };
  }

  redirect("/");
}
