"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setActiveAccountId } from "@/lib/account-context";

export async function switchAccountAction(formData: FormData) {
  const accountId = String(formData.get("account_id") ?? "");
  if (!accountId) return;
  await setActiveAccountId(accountId);
  revalidatePath("/");
  redirect("/");
}
