import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getReminderSettings,
  maybeSendScheduledReminders,
  requestNotificationPermission,
  saveReminderSettings
} from "@/features/settings/notifications";

const notificationSpy = vi.fn();

class MockNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn(async () => "granted" as const);

  constructor(title: string, options?: NotificationOptions) {
    notificationSpy(title, options);
  }
}

describe("notification settings", () => {
  beforeEach(() => {
    window.localStorage.clear();
    notificationSpy.mockClear();
    MockNotification.permission = "granted";
    MockNotification.requestPermission.mockClear();
    vi.stubGlobal("Notification", MockNotification);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("clamps persisted reminder hours into the supported 0-23 range", () => {
    window.localStorage.setItem(
      "leader-health-reminders",
      JSON.stringify({
        energyReminderEnabled: false,
        strengthMorningEnabled: true,
        strengthReminderHour: 27
      })
    );

    expect(getReminderSettings()).toEqual({
      energyReminderEnabled: false,
      strengthMorningEnabled: true,
      strengthReminderHour: 23
    });

    window.localStorage.setItem(
      "leader-health-reminders",
      JSON.stringify({
        energyReminderEnabled: false,
        strengthMorningEnabled: true,
        strengthReminderHour: -4
      })
    );

    expect(getReminderSettings().strengthReminderHour).toBe(0);
  });

  it("falls back to defaults for missing or malformed stored settings", () => {
    expect(getReminderSettings()).toEqual({
      energyReminderEnabled: false,
      strengthMorningEnabled: false,
      strengthReminderHour: 7
    });

    window.localStorage.setItem("leader-health-reminders", "{");

    expect(getReminderSettings()).toEqual({
      energyReminderEnabled: false,
      strengthMorningEnabled: false,
      strengthReminderHour: 7
    });
  });

  it("saves reminder hours in clamped form", () => {
    saveReminderSettings({
      energyReminderEnabled: false,
      strengthMorningEnabled: true,
      strengthReminderHour: 99
    });

    expect(getReminderSettings().strengthReminderHour).toBe(23);
  });

  it("returns the current notification permission without prompting when already granted", async () => {
    await expect(requestNotificationPermission()).resolves.toBe("granted");
    expect(MockNotification.requestPermission).not.toHaveBeenCalled();
  });

  it("requests notification permission when permission has not been granted yet", async () => {
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValueOnce("denied");

    await expect(requestNotificationPermission()).resolves.toBe("denied");
    expect(MockNotification.requestPermission).toHaveBeenCalledOnce();
  });

  it("returns unsupported and keeps helpers safe when browser notifications are unavailable", async () => {
    vi.unstubAllGlobals();
    // Simulate a non-browser environment for the runtime guards.
    vi.stubGlobal("window", undefined);

    expect(getReminderSettings()).toEqual({
      energyReminderEnabled: false,
      strengthMorningEnabled: false,
      strengthReminderHour: 7
    });

    expect(() =>
      saveReminderSettings({
        energyReminderEnabled: true,
        strengthMorningEnabled: true,
        strengthReminderHour: 12
      })
    ).not.toThrow();

    expect(() => maybeSendScheduledReminders(new Date(2026, 4, 5, 12, 1, 0))).not.toThrow();
    await expect(requestNotificationPermission()).resolves.toBe("unsupported");
  });

  it("sends the daily energy reminder only once per day", () => {
    window.localStorage.setItem(
      "leader-health-reminders",
      JSON.stringify({
        energyReminderEnabled: true,
        strengthMorningEnabled: false,
        strengthReminderHour: 7
      })
    );

    maybeSendScheduledReminders(new Date(2026, 4, 5, 15, 1, 0));
    maybeSendScheduledReminders(new Date(2026, 4, 5, 15, 1, 30));

    expect(notificationSpy).toHaveBeenCalledOnce();
    expect(notificationSpy).toHaveBeenCalledWith("Energi-innsjekk", {
      body: "Hvordan er energien din akkurat nå på en skala fra 1 til 5?"
    });
  });

  it("still sends strength reminders at the clamped hour", () => {
    window.localStorage.setItem(
      "leader-health-reminders",
      JSON.stringify({
        energyReminderEnabled: false,
        strengthMorningEnabled: true,
        strengthReminderHour: 27
      })
    );

    maybeSendScheduledReminders(new Date(2026, 4, 5, 23, 1, 0));

    expect(notificationSpy).toHaveBeenCalledOnce();
    expect(notificationSpy).toHaveBeenCalledWith("Styrkepåminnelse", {
      body: "Planlegg en styrkeøkt i morgen tidlig."
    });
  });

  it("does not send reminders when notification permission is denied", () => {
    MockNotification.permission = "denied";
    window.localStorage.setItem(
      "leader-health-reminders",
      JSON.stringify({
        energyReminderEnabled: false,
        strengthMorningEnabled: true,
        strengthReminderHour: 23
      })
    );

    maybeSendScheduledReminders(new Date(2026, 4, 5, 23, 1, 0));

    expect(notificationSpy).not.toHaveBeenCalled();
  });
});
