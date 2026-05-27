"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
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

function readLocale(): Locale {
  return getLanguage() ?? "no";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("leader-health-language-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("leader-health-language-change", onStoreChange);
      };
    },
    readLocale,
    () => "no"
  );

  useEffect(() => {
    document.documentElement.lang = getTranslation(locale).intlLocale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
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
