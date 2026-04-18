"use client";

import { useEffect } from "react";
import { maybeSendScheduledReminders } from "@/features/settings/notifications";

export function ReminderEngine() {
  useEffect(() => {
    maybeSendScheduledReminders();
    const timer = window.setInterval(() => {
      maybeSendScheduledReminders();
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}
