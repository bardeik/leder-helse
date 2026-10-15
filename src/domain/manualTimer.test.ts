import { describe, expect, it } from "vitest";
import { advanceManualTimer, createManualTimer, DEFAULT_MANUAL_TIMER_SETTINGS } from "@/domain/manualTimer";
import { manualTimerSettingsSchema } from "@/domain/schemas";

describe("manual timer", () => {
  const settings = DEFAULT_MANUAL_TIMER_SETTINGS;

  it("defaults to 40 seconds activity, 20 seconds rest and six rounds", () => {
    expect(settings).toEqual({ activitySeconds: 40, restSeconds: 20, rounds: 6 });
    expect(createManualTimer()).toEqual({ phase: "ready", remainingMs: 3000, completedRounds: 0 });
  });

  it("starts activity after exactly three seconds", () => {
    expect(advanceManualTimer(createManualTimer(), settings, 2999).remainingMs).toBe(1);
    expect(advanceManualTimer(createManualTimer(), settings, 3000)).toEqual({
      phase: "activity",
      remainingMs: 40000,
      completedRounds: 0
    });
  });

  it("counts completed activity and then starts rest", () => {
    expect(advanceManualTimer(createManualTimer(), settings, 43000)).toEqual({
      phase: "rest",
      remainingMs: 20000,
      completedRounds: 1
    });
    expect(advanceManualTimer(createManualTimer(), settings, 63000)).toEqual({
      phase: "activity",
      remainingMs: 40000,
      completedRounds: 1
    });
  });

  it("finishes after 343 seconds without a final rest", () => {
    expect(advanceManualTimer(createManualTimer(), settings, 343000)).toEqual({
      phase: "complete",
      remainingMs: 0,
      completedRounds: 6
    });
  });

  it("handles delayed callbacks across multiple phases without drift", () => {
    const first = advanceManualTimer(createManualTimer(), settings, 12345);
    expect(advanceManualTimer(first, settings, 98765)).toEqual(
      advanceManualTimer(createManualTimer(), settings, 111110)
    );
  });

  it("supports no rest and a single round", () => {
    expect(advanceManualTimer(createManualTimer(), { ...settings, restSeconds: 0 }, 243000).phase).toBe("complete");
    expect(advanceManualTimer(createManualTimer(), { ...settings, rounds: 1 }, 43000).phase).toBe("complete");
  });

  it("does not advance for negative elapsed time or after completion", () => {
    const initial = createManualTimer();
    expect(advanceManualTimer(initial, settings, -10)).toEqual(initial);
    const completed = advanceManualTimer(initial, settings, 999999);
    expect(advanceManualTimer(completed, settings, 5000)).toEqual(completed);
  });

  it.each([
    { activitySeconds: 0 },
    { activitySeconds: 601 },
    { activitySeconds: 10.5 },
    { restSeconds: -1 },
    { restSeconds: 601 },
    { rounds: 0 },
    { rounds: 100 },
    { rounds: Number.NaN }
  ])("rejects invalid settings %o", (invalid) => {
    expect(manualTimerSettingsSchema.safeParse({ ...settings, ...invalid }).success).toBe(false);
  });

  it("accepts supported boundaries", () => {
    expect(manualTimerSettingsSchema.safeParse({ activitySeconds: 10, restSeconds: 0, rounds: 1 }).success).toBe(true);
    expect(manualTimerSettingsSchema.safeParse({ activitySeconds: 600, restSeconds: 600, rounds: 99 }).success).toBe(
      true
    );
  });
});
