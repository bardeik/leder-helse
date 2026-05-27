import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguagePrompt } from "@/i18n/LanguagePrompt";
import { LanguageProvider, useTranslation } from "@/i18n/LanguageProvider";

function LocaleProbe() {
  const { locale, translations } = useTranslation();
  return (
    <p data-testid="locale-probe">
      {locale}:{translations.nav.pages.home}
    </p>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "no";
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "no";
  });

  it("shows the language prompt and saves the selected locale", () => {
    render(
      <LanguageProvider>
        <LanguagePrompt />
        <LocaleProbe />
      </LanguageProvider>
    );

    expect(screen.getByRole("heading", { name: "Velg språk" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: "English" }).click();
    });

    expect(window.localStorage.getItem("leader-health-language")).toBe("en");
    expect(document.documentElement.lang).toBe("en-US");
    expect(screen.getByTestId("locale-probe")).toHaveTextContent("en:Overview");
    expect(screen.queryByRole("heading", { name: "Velg språk" })).toBeNull();
  });

  it("uses the stored locale when the app starts", () => {
    window.localStorage.setItem("leader-health-language", "en");

    render(
      <LanguageProvider>
        <LanguagePrompt />
        <LocaleProbe />
      </LanguageProvider>
    );

    expect(document.documentElement.lang).toBe("en-US");
    expect(screen.getByTestId("locale-probe")).toHaveTextContent("en:Overview");
    expect(screen.queryByRole("heading", { name: "Velg språk" })).toBeNull();
  });
});
