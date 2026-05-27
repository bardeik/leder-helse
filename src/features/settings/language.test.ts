import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { clearLanguage, getLanguage, saveLanguage } from "@/features/settings/language";

describe("language storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no language is stored", () => {
    expect(getLanguage()).toBeNull();
  });

  it("persists and reads supported languages", () => {
    saveLanguage("en");
    expect(getLanguage()).toBe("en");

    saveLanguage("no");
    expect(getLanguage()).toBe("no");
  });

  it("ignores unsupported stored values", () => {
    window.localStorage.setItem("leader-health-language", "fr");
    expect(getLanguage()).toBeNull();
  });

  it("clears the persisted language", () => {
    saveLanguage("en");
    clearLanguage();
    expect(getLanguage()).toBeNull();
  });
});
