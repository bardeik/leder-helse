import { describe, expect, it } from "vitest";
import { getRandomMotivationalQuote, motivationalQuotesByLocale } from "@/features/dashboard/motivationalQuotes";

describe("getRandomMotivationalQuote", () => {
  it("returns a quote from the array", () => {
    const quote = getRandomMotivationalQuote("no");
    expect(quote).toHaveProperty("text");
    expect(quote).toHaveProperty("author");
    expect(typeof quote.text).toBe("string");
    expect(quote.text.length).toBeGreaterThan(0);
  });

  it("uses the provided random function to select a quote", () => {
    const quote = getRandomMotivationalQuote("no", () => 0);
    expect(quote).toBe(motivationalQuotesByLocale.no[0]);
  });

  it("selects the last quote when random returns just below 1", () => {
    const last = motivationalQuotesByLocale.no[motivationalQuotesByLocale.no.length - 1]!;
    const quote = getRandomMotivationalQuote("no", () => 0.9999);
    expect(quote).toBe(last);
  });

  it("falls back to the first quote when index is out of bounds", () => {
    // random() returning exactly 1.0 would produce index === length, triggering fallback
    const quote = getRandomMotivationalQuote("no", () => 1);
    expect(quote).toBe(motivationalQuotesByLocale.no[0]);
  });

  it("all quotes have non-empty text and author in both locales", () => {
    for (const quotes of Object.values(motivationalQuotesByLocale)) {
      for (const quote of quotes) {
        expect(quote.text.trim().length).toBeGreaterThan(0);
        expect(quote.author.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("provides different copy for Norwegian and English", () => {
    expect(motivationalQuotesByLocale.no[0]?.text).not.toBe(motivationalQuotesByLocale.en[0]?.text);
    expect(motivationalQuotesByLocale.no[0]?.author).not.toBe(motivationalQuotesByLocale.en[0]?.author);
  });
});
