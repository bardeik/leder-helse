import { en } from "@/i18n/locales/en";
import { no } from "@/i18n/locales/no";
import type { Locale, TranslationDict } from "@/i18n/types";

export const translations: Record<Locale, TranslationDict> = {
  no,
  en
};

export function getTranslation(locale: Locale): TranslationDict {
  return translations[locale];
}
