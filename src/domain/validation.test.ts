import { describe, expect, it } from "vitest";
import { MAX_BACKUP_ITEMS_PER_TABLE } from "@/domain/backupLimits";
import { backupSchema, workoutTypeSchema } from "@/domain/schemas";
import { parseBackupData, validateDailyLog, validateWeeklyCheckIn, validateWorkoutLog } from "@/domain/validation";

describe("domain validation helpers", () => {
  it("accepts valid client-side log objects without zod", () => {
    expect(() => validateDailyLog({ date: "2026-04-20", energy: 3, sleepOk: true, notes: "" })).not.toThrow();

    expect(() =>
      validateWeeklyCheckIn({ weekStartDate: "2026-04-14", weightKg: 82.4, adjustment: "Legge meg tidligere" })
    ).not.toThrow();

    expect(() =>
      validateWorkoutLog({ dateTime: "2026-04-20T12:00:00.000Z", date: "2026-04-20", type: "walk", durationMin: 30 })
    ).not.toThrow();

    expect(() =>
      validateWorkoutLog({
        dateTime: "2026-04-20T12:00:00.000Z",
        date: "2026-04-20",
        type: "strength",
        durationMin: 45
      })
    ).not.toThrow();
  });

  it("rejects timestamps that are not canonical ISO-8601 UTC strings", () => {
    expect(() =>
      validateWorkoutLog({ dateTime: "2026-04-20T12:00:00Z", date: "2026-04-20", type: "walk", durationMin: 30 })
    ).toThrow("Tidspunkt må være en ISO-tidsstreng.");

    expect(() =>
      validateWorkoutLog({
        dateTime: "2026-04-20T12:00:00.000+02:00",
        date: "2026-04-20",
        type: "walk",
        durationMin: 30
      })
    ).toThrow("Tidspunkt må være en ISO-tidsstreng.");

    expect(() =>
      parseBackupData({
        version: 1,
        exportedAt: "2026-13-20T08:24:30.102Z",
        dailyLogs: [],
        weeklyCheckIns: [],
        workoutLogs: []
      })
    ).toThrow("Eksporttidspunkt må være en ISO-tidsstreng.");
  });

  it("parses backup data from plain json-compatible objects", () => {
    const parsed = parseBackupData({
      version: 1,
      exportedAt: "2026-04-20T08:24:30.102Z",
      dailyLogs: [{ date: "2026-04-20", energy: 3, sleepOk: true, notes: "" }],
      weeklyCheckIns: [],
      workoutLogs: [{ dateTime: "2026-04-20T12:00:00.000Z", date: "2026-04-20", type: "strengthA" }]
    });

    expect(parsed.dailyLogs).toHaveLength(1);
    expect(parsed.dailyLogs[0]?.date).toBe("2026-04-20");
    expect(parsed.workoutLogs[0]?.type).toBe("strength");
  });

  it("rejects backup collections that exceed the max item count", () => {
    expect(() =>
      parseBackupData({
        version: 1,
        exportedAt: "2026-04-20T08:24:30.102Z",
        dailyLogs: Array.from({ length: MAX_BACKUP_ITEMS_PER_TABLE + 1 }, () => ({
          date: "2026-04-20",
          energy: 3,
          sleepOk: true
        })),
        weeklyCheckIns: [],
        workoutLogs: []
      })
    ).toThrow(`Daglige logger kan ikke inneholde mer enn ${MAX_BACKUP_ITEMS_PER_TABLE} elementer.`);
  });

  it("reports which imported item is invalid", () => {
    expect(() =>
      parseBackupData({
        version: 1,
        exportedAt: "2026-04-20T08:24:30.102Z",
        dailyLogs: [],
        weeklyCheckIns: [],
        workoutLogs: [{ dateTime: "ikke-en-tid", date: "2026-04-20", type: "walk" }]
      })
    ).toThrow("Aktiviteter inneholder ugyldig element 1: Tidspunkt må være en ISO-tidsstreng.");
  });

  it("enforces backup collection limits in the zod backup schema", () => {
    const result = backupSchema.safeParse({
      version: 1,
      exportedAt: "2026-04-20T08:24:30.102Z",
      dailyLogs: Array.from({ length: MAX_BACKUP_ITEMS_PER_TABLE + 1 }, () => ({
        date: "2026-04-20",
        energy: 3,
        sleepOk: true
      })),
      weeklyCheckIns: [],
      workoutLogs: []
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0]?.message).toBe(
      `Daglige logger kan ikke inneholde mer enn ${MAX_BACKUP_ITEMS_PER_TABLE} elementer.`
    );
  });

  it("normalizes workout types in zod-based backup parsing", () => {
    expect(workoutTypeSchema.parse("strengthA")).toBe("strength");
    expect(workoutTypeSchema.parse("walk")).toBe("walk");

    const parsed = backupSchema.parse({
      version: 1,
      exportedAt: "2026-04-20T08:24:30.102Z",
      dailyLogs: [],
      weeklyCheckIns: [],
      workoutLogs: [{ dateTime: "2026-04-20T12:00:00.000Z", date: "2026-04-20", type: "strengthB" }]
    });

    expect(parsed.workoutLogs[0]?.type).toBe("strength");
  });
});
