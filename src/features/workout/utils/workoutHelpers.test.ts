import { describe, expect, it } from "vitest";
import { exercises } from "@/features/workout/data/exercises";
import {
  calculateProgress,
  formatTime,
  getNextExercise,
  isLastExerciseInRound,
  isLastRound
} from "@/features/workout/utils/workoutHelpers";

describe("workoutHelpers", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
  });

  it("calculates rounded progress percent", () => {
    expect(calculateProgress(0, 27)).toBe(0);
    expect(calculateProgress(5, 27)).toBe(19);
    expect(calculateProgress(27, 27)).toBe(100);
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it("finds round and workout boundaries", () => {
    expect(isLastExerciseInRound(9, 9)).toBe(true);
    expect(isLastExerciseInRound(3, 9)).toBe(false);
    expect(isLastRound(3, 3)).toBe(true);
    expect(isLastRound(1, 3)).toBe(false);
  });

  it("returns the next exercise in sequence", () => {
    expect(getNextExercise(1, exercises)?.name).toBe("Pushups");
    expect(getNextExercise(8, exercises)?.name).toBe("Planke med vri");
    expect(getNextExercise(9, exercises)).toBeUndefined();
  });
});
