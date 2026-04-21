import { describe, expect, it, vi } from "vitest";
import {
  buildWeeklyTrends,
  calculateWeeklyAdherence,
  calculateWeeklyWorkoutProgress,
  getHealthStatus,
  getRecentWeekStarts,
  getWeekStartDate
} from "@/domain/calc";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";

describe("domain calculations", () => {
  it("finds monday as week start", () => {
    expect(getWeekStartDate("2026-04-19")).toBe("2026-04-13");
  });

  it("maps adherence status thresholds", () => {
    expect(getHealthStatus(80)).toBe("green");
    expect(getHealthStatus(79)).toBe("yellow");
    expect(getHealthStatus(49)).toBe("red");
  });

  it("calculates weekly adherence", () => {
    const dailyLogs: DailyLog[] = [
      { date: "2026-04-13", energy: 4, sleepOk: true },
      { date: "2026-04-14", energy: 4, sleepOk: true },
      { date: "2026-04-15", energy: 3, sleepOk: false }
    ];
    const workouts: WorkoutLog[] = [
      { dateTime: "2026-04-13T07:00:00.000Z", date: "2026-04-13", type: "strength" },
      { dateTime: "2026-04-15T07:00:00.000Z", date: "2026-04-15", type: "walk" }
    ];

    const result = calculateWeeklyAdherence("2026-04-13", dailyLogs, workouts);

    expect(result.energyDays).toBe(3);
    expect(result.sleepDays).toBe(3);
    expect(result.workouts).toBe(2);
    expect(result.adherencePercent).toBe(38);
    expect(result.status).toBe("red");
  });

  it("counts up to two strength sessions and five walks toward the weekly workout goal", () => {
    const progress = calculateWeeklyWorkoutProgress("2026-04-13", [
      { dateTime: "2026-04-13T07:00:00.000Z", date: "2026-04-13", type: "strength" },
      { dateTime: "2026-04-14T07:00:00.000Z", date: "2026-04-14", type: "strength" },
      { dateTime: "2026-04-15T07:00:00.000Z", date: "2026-04-15", type: "strength" },
      { dateTime: "2026-04-16T07:00:00.000Z", date: "2026-04-16", type: "walk" }
    ]);

    expect(progress.strengthWorkouts).toBe(3);
    expect(progress.walks).toBe(1);
    expect(progress.completedGoals).toBe(3);
    expect(progress.remainingStrengthWorkouts).toBe(0);
    expect(progress.remainingWalks).toBe(4);
  });

  it("builds weekly trends", () => {
    vi.setSystemTime(new Date("2026-04-18T12:00:00Z"));
    const weeks = getRecentWeekStarts("2026-04-18", 2);

    const dailyLogs: DailyLog[] = [
      { date: weeks[0]!, energy: 2, sleepOk: true },
      { date: weeks[1]!, energy: 4, sleepOk: true },
      { date: weeks[1]!, energy: 5, sleepOk: false }
    ];
    const checkIns: WeeklyCheckIn[] = [
      { weekStartDate: weeks[0]!, weightKg: 82.4 },
      { weekStartDate: weeks[1]!, weightKg: 81.9 }
    ];

    const points = buildWeeklyTrends(weeks, dailyLogs, checkIns);

    expect(points[1]?.weightDeltaKg).toBe(-0.5);
    expect(points[1]?.energyAverage).toBe(4.5);
    expect(points[1]?.sleepOkCount).toBe(1);
  });
});
