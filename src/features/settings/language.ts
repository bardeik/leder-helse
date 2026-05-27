import type { Locale } from "@/i18n/types";

const STORAGE_KEY = "leader-health-language";
const SUPPORTED_LOCALES: Locale[] = ["no", "en"];

export function isLocale(value: unknown): value is Locale {
  return value === "no" || value === "en";
}

/** Returns the persisted locale, or null if none has been chosen yet. */
export function getLanguage(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(raw)) {
    return raw;
  }

  return null;
}

/** Persists the chosen locale to localStorage. */
export function saveLanguage(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
}

/** Clears the persisted language selection. */
export function clearLanguage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
