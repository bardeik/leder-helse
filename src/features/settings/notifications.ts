export interface ReminderSettings {
  energyReminderEnabled: boolean;
  strengthMorningEnabled: boolean;
  strengthReminderHour: number;
}

const STORAGE_KEY = "leader-health-reminders";
const ENERGY_SENT_KEY = "leader-health-energy-sent";
const STRENGTH_SENT_KEY = "leader-health-strength-sent";

export function getReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") {
    return { energyReminderEnabled: false, strengthMorningEnabled: false, strengthReminderHour: 7 };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { energyReminderEnabled: false, strengthMorningEnabled: false, strengthReminderHour: 7 };
  }

  try {
    const parsed = JSON.parse(raw) as ReminderSettings;
    return {
      energyReminderEnabled: Boolean(parsed.energyReminderEnabled),
      strengthMorningEnabled: Boolean(parsed.strengthMorningEnabled),
      strengthReminderHour: Number.isFinite(parsed.strengthReminderHour) ? parsed.strengthReminderHour : 7
    };
  } catch {
    return { energyReminderEnabled: false, strengthMorningEnabled: false, strengthReminderHour: 7 };
  }
}

export function saveReminderSettings(settings: ReminderSettings) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  return Notification.requestPermission();
}

function sendNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }
  new Notification(title, { body });
}

export function maybeSendScheduledReminders(now = new Date()) {
  if (typeof window === "undefined") {
    return;
  }

  const settings = getReminderSettings();
  const dateKey = now.toISOString().slice(0, 10);

  if (settings.energyReminderEnabled && now.getHours() === 15 && now.getMinutes() < 2) {
    const sentAt = window.localStorage.getItem(ENERGY_SENT_KEY);
    if (sentAt !== dateKey) {
      sendNotification("Energy check-in", "How is your energy right now on a 1-5 scale?");
      window.localStorage.setItem(ENERGY_SENT_KEY, dateKey);
    }
  }

  if (settings.strengthMorningEnabled && now.getHours() === settings.strengthReminderHour && now.getMinutes() < 2) {
    const sentAt = window.localStorage.getItem(STRENGTH_SENT_KEY);
    if (sentAt !== dateKey) {
      sendNotification("Strength reminder", "Plan either Strength A or Strength B this morning.");
      window.localStorage.setItem(STRENGTH_SENT_KEY, dateKey);
    }
  }
}
