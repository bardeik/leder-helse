import { describe, expect, it } from "vitest";
import { formatWorkoutType, normalizeWorkoutType } from "@/domain/workouts";

describe("workout helpers", () => {
  it("normalizes legacy strength workout types", () => {
    expect(normalizeWorkoutType("strengthA")).toBe("strength");
    expect(normalizeWorkoutType("strengthB")).toBe("strength");
    expect(normalizeWorkoutType("strength")).toBe("strength");
    expect(normalizeWorkoutType("walk")).toBe("walk");
  });

  it("formats workout labels in Norwegian", () => {
    expect(formatWorkoutType("strength")).toBe("Styrkeøkt");
    expect(formatWorkoutType("walk")).toBe("Gåtur");
  });
});
