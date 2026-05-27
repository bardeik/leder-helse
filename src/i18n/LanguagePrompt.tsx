"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { getLanguage } from "@/features/settings/language";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguagePrompt() {
  const language = useLanguage();
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!language || !isMounted) {
    return null;
  }

  if (typeof window === "undefined" || getLanguage()) {
    return null;
  }

  const { translations, setLocale } = language;

  return createPortal(
    <div className="language-prompt-overlay" role="dialog" aria-modal="true" aria-labelledby="language-prompt-title">
      <section className="card language-prompt-card">
        <h1 id="language-prompt-title">{translations.languagePrompt.title}</h1>
        <p>{translations.languagePrompt.body}</p>
        <div className="settings-actions">
          <button className="primary" type="button" onClick={() => setLocale("no")}>
            {translations.languagePrompt.norskButton}
          </button>
          <button className="secondary" type="button" onClick={() => setLocale("en")}>
            {translations.languagePrompt.englishButton}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
