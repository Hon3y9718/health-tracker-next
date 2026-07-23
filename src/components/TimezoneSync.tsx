"use client";

import { useEffect } from "react";
import { syncTimezone } from "@/app/actions/syncTimezone";

// Keeps user_settings.timezone in step with the browser so every server-rendered "today"
// (dashboard, log-date defaults) agrees with the user's actual local calendar day.
export function TimezoneSync({ currentTimezone }: { currentTimezone: string }) {
  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && browserTimezone !== currentTimezone) {
      syncTimezone(browserTimezone);
    }
  }, [currentTimezone]);

  return null;
}
