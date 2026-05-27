import { getTranslation } from "@/i18n/locales";
import type { Locale } from "@/i18n/types";
import { getLanguage } from "@/features/settings/language";

export interface ReminderSettings {
  energyReminderEnabled: boolean;
  strengthMorningEnabled: boolean;
  strengthReminderHour: number;
}

const STORAGE_KEY = "leader-health-reminders";
const ENERGY_SENT_KEY = "leader-health-energy-sent";
const STRENGTH_SENT_KEY = "leader-health-strength-sent";
const DEFAULT_REMINDER_HOUR = 7;

function clampReminderHour(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_REMINDER_HOUR;
  }

  return Math.min(23, Math.max(0, Math.trunc(numericValue)));
}

function normalizeReminderSettings(input: Partial<ReminderSettings> | null | undefined): ReminderSettings {
  return {
    energyReminderEnabled: Boolean(input?.energyReminderEnabled),
    strengthMorningEnabled: Boolean(input?.strengthMorningEnabled),
    strengthReminderHour: clampReminderHour(input?.strengthReminderHour)
  };
}

export function getReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") {
    return normalizeReminderSettings(undefined);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeReminderSettings(undefined);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return normalizeReminderSettings(parsed);
  } catch {
    return normalizeReminderSettings(undefined);
  }
}

export function saveReminderSettings(settings: ReminderSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeReminderSettings(settings)));
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

function getReminderText(locale: Locale) {
  return getTranslation(locale).notifications;
}

export function maybeSendScheduledReminders(now = new Date()) {
  if (typeof window === "undefined") {
    return;
  }

  const settings = getReminderSettings();
  const locale = getLanguage() ?? "no";
  const texts = getReminderText(locale);
  const dateKey = now.toISOString().slice(0, 10);

  if (settings.energyReminderEnabled && now.getHours() === 15 && now.getMinutes() < 2) {
    const sentAt = window.localStorage.getItem(ENERGY_SENT_KEY);
    if (sentAt !== dateKey) {
      sendNotification(texts.energyTitle, texts.energyBody);
      window.localStorage.setItem(ENERGY_SENT_KEY, dateKey);
    }
  }

  if (settings.strengthMorningEnabled && now.getHours() === settings.strengthReminderHour && now.getMinutes() < 2) {
    const sentAt = window.localStorage.getItem(STRENGTH_SENT_KEY);
    if (sentAt !== dateKey) {
      sendNotification(texts.strengthTitle, texts.strengthBody);
      window.localStorage.setItem(STRENGTH_SENT_KEY, dateKey);
    }
  }
}
