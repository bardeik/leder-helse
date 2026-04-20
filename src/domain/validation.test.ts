import { describe, expect, it } from "vitest";
import { parseBackupData, validateDailyLog, validateWeeklyCheckIn, validateWorkoutLog } from "@/domain/validation";

describe("domain validation helpers", () => {
  it("accepts valid client-side log objects without zod", () => {
    expect(() =>
      validateDailyLog({ date: "2026-04-20", energy: 3, sleepOk: true, notes: "" })
    ).not.toThrow();

    expect(() =>
      validateWeeklyCheckIn({ weekStartDate: "2026-04-14", weightKg: 82.4, adjustment: "Legge meg tidligere" })
    ).not.toThrow();

    expect(() =>
      validateWorkoutLog({ dateTime: "2026-04-20T12:00:00.000Z", date: "2026-04-20", type: "walk", durationMin: 30 })
    ).not.toThrow();
  });

  it("parses backup data from plain json-compatible objects", () => {
    const parsed = parseBackupData({
      version: 1,
      exportedAt: "2026-04-20T08:24:30.102Z",
      dailyLogs: [{ date: "2026-04-20", energy: 3, sleepOk: true, notes: "" }],
      weeklyCheckIns: [],
      workoutLogs: []
    });

    expect(parsed.dailyLogs).toHaveLength(1);
    expect(parsed.dailyLogs[0]?.date).toBe("2026-04-20");
  });
});
