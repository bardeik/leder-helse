import { describe, expect, it } from "vitest";
import { exercises, getExercises, getWorkoutSummaryVideoUrl } from "@/features/workout/data/exercises";

describe("localized workout exercises", () => {
  it("keeps Norwegian as the default workout data", () => {
    expect(exercises[0]?.name).toBe("Knebøy");
    expect(getExercises("no")[8]?.name).toBe("Planke med vri");
  });

  it("returns English workout data and summary video urls", () => {
    expect(getExercises("en")[0]?.name).toBe("Squat");
    expect(getExercises("en")[8]?.description).toContain("upper back");
    expect(getWorkoutSummaryVideoUrl("en")).toContain("culture=en-us");
  });
});
