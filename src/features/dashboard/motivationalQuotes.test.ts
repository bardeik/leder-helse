import { describe, expect, it } from "vitest";
import { getRandomMotivationalQuote, motivationalQuotes } from "@/features/dashboard/motivationalQuotes";

describe("getRandomMotivationalQuote", () => {
  it("returns a quote from the array", () => {
    const quote = getRandomMotivationalQuote();
    expect(quote).toHaveProperty("text");
    expect(quote).toHaveProperty("author");
    expect(typeof quote.text).toBe("string");
    expect(quote.text.length).toBeGreaterThan(0);
  });

  it("uses the provided random function to select a quote", () => {
    const quote = getRandomMotivationalQuote(() => 0);
    expect(quote).toBe(motivationalQuotes[0]);
  });

  it("selects the last quote when random returns just below 1", () => {
    const last = motivationalQuotes[motivationalQuotes.length - 1]!;
    const quote = getRandomMotivationalQuote(() => 0.9999);
    expect(quote).toBe(last);
  });

  it("falls back to the first quote when index is out of bounds", () => {
    // random() returning exactly 1.0 would produce index === length, triggering fallback
    const quote = getRandomMotivationalQuote(() => 1);
    expect(quote).toBe(motivationalQuotes[0]);
  });

  it("all quotes have non-empty text and author", () => {
    for (const quote of motivationalQuotes) {
      expect(quote.text.trim().length).toBeGreaterThan(0);
      expect(quote.author.trim().length).toBeGreaterThan(0);
    }
  });
});
