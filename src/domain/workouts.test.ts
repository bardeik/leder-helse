import { describe, expect, it } from "vitest";
import { formatWorkoutType, normalizeWorkoutType } from "@/domain/workouts";

describe("workout helpers", () => {
  it("normalizes legacy strength workout types", () => {
    expect(normalizeWorkoutType("strengthA")).toBe("strength");
    expect(normalizeWorkoutType("strengthB")).toBe("strength");
    expect(normalizeWorkoutType("strength")).toBe("strength");
    expect(normalizeWorkoutType("walk")).toBe("walk");
  });

  it("returns undefined for unknown workout types", () => {
    expect(normalizeWorkoutType("run")).toBeUndefined();
    expect(normalizeWorkoutType("")).toBeUndefined();
  });

  it("formats workout labels in Norwegian", () => {
    expect(formatWorkoutType("strength")).toBe("Styrkeøkt");
    expect(formatWorkoutType("walk")).toBe("Gåtur");
  });

  it("formats workout labels in English", () => {
    expect(formatWorkoutType("strength", "en")).toBe("Strength workout");
    expect(formatWorkoutType("walk", "en")).toBe("Walk");
  });
});
