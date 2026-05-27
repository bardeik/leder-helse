"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLanguage, saveLanguage } from "@/features/settings/language";
import { getTranslation } from "@/i18n/locales";
import type { Locale, TranslationDict } from "@/i18n/types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: TranslationDict;
}

const defaultTranslations = getTranslation("no");

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLanguage() ?? "no");

  useEffect(() => {
    document.documentElement.lang = getTranslation(locale).intlLocale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    saveLanguage(nextLocale);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      translations: getTranslation(locale)
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div suppressHydrationWarning>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  return useLanguage() ?? {
    locale: "no" as Locale,
    setLocale: (_locale: Locale) => undefined,
    translations: defaultTranslations
  };
}
