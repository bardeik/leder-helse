import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { parseLocalNumber, formatLocalNumber, getDecimalSeparator } from "@/domain/localeNumber";

describe("locale number utilities", () => {
  describe("parseLocalNumber", () => {
    it("parses integers", () => {
      expect(parseLocalNumber("75")).toBe(75);
      expect(parseLocalNumber("0")).toBe(0);
      expect(parseLocalNumber("100")).toBe(100);
    });

    it("parses numbers with . decimal separator", () => {
      expect(parseLocalNumber("75.5")).toBe(75.5);
      expect(parseLocalNumber("7.25")).toBe(7.25);
    });

    it("parses numbers with , decimal separator", () => {
      expect(parseLocalNumber("75,5")).toBe(75.5);
      expect(parseLocalNumber("7,25")).toBe(7.25);
    });

    it("returns 0 for empty string", () => {
      expect(parseLocalNumber("")).toBe(0);
    });

    it("returns 0 for non-numeric input", () => {
      expect(parseLocalNumber("abc")).toBe(0);
    });

    it("handles partial input like user is typing", () => {
      expect(parseLocalNumber("75.")).toBe(75);
      expect(parseLocalNumber("7.5")).toBe(7.5);
      expect(parseLocalNumber("75,")).toBe(75);
      expect(parseLocalNumber("7,5")).toBe(7.5);
    });
  });

  describe("formatLocalNumber", () => {
    it("formats numbers with 1 fraction digit by default", () => {
      const result = formatLocalNumber(75.5);
      expect(result).toBeTruthy();
      expect(result).toMatch(/75[.,]5/);
    });

    it("formats with specified fraction digits", () => {
      const result = formatLocalNumber(75.555, 2);
      expect(result).toMatch(/75[.,]56|75[.,]55/); // depends on rounding
    });

    it("returns empty string for undefined", () => {
      expect(formatLocalNumber(undefined)).toBe("");
    });

    it("returns empty string for null", () => {
      expect(formatLocalNumber(null as unknown as number)).toBe("");
    });

    it("formats integers with fraction digits", () => {
      const result = formatLocalNumber(75, 1);
      expect(result).toMatch(/75[.,]0/);
    });
  });

  describe("getDecimalSeparator", () => {
    it("returns the locale decimal separator", () => {
      const separator = getDecimalSeparator();
      expect(separator).toMatch(/[.,]/);
    });
  });

  describe("integration: typing flow", () => {
    it("handles typing a number with decimal like user input", () => {
      // Simulate user typing: "7" -> "75" -> "75." -> "75.5"
      expect(parseLocalNumber("7")).toBe(7);
      expect(parseLocalNumber("75")).toBe(75);
      expect(parseLocalNumber("75.")).toBe(75); // incomplete decimal
      expect(parseLocalNumber("75.5")).toBe(75.5); // complete number
    });

    it("handles typing with comma decimal separator", () => {
      // Simulate user typing with comma: "7" -> "75" -> "75," -> "75,5"
      expect(parseLocalNumber("7")).toBe(7);
      expect(parseLocalNumber("75")).toBe(75);
      expect(parseLocalNumber("75,")).toBe(75);
      expect(parseLocalNumber("75,5")).toBe(75.5);
    });
  });
});
