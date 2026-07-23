"use server";

import { updateUserSettings } from "@/lib/queries/settings";

export async function syncTimezone(timezone: string) {
  if (!timezone) return;
  await updateUserSettings({ timezone });
}
