import { describe, expect, it, vi } from "vitest";
import { exportBackup, importBackup, type BackupDataSource } from "@/data/backup";

function createMockDb(): BackupDataSource {
  const dailyLogsData = [{ date: "2026-04-18", energy: 4, sleepOk: true }];
  const weeklyCheckInData = [{ weekStartDate: "2026-04-13", weightKg: 80.2 }];
  const workoutData = [{ id: 1, dateTime: "2026-04-18T07:15:00.000Z", date: "2026-04-18", type: "walk" }];

  return {
    dailyLogs: {
      toArray: vi.fn(async () => dailyLogsData),
      bulkPut: vi.fn(async () => undefined),
      clear: vi.fn(async () => undefined)
    },
    weeklyCheckIns: {
      toArray: vi.fn(async () => weeklyCheckInData),
      bulkPut: vi.fn(async () => undefined),
      clear: vi.fn(async () => undefined)
    },
    workoutLogs: {
      toArray: vi.fn(async () => workoutData),
      bulkPut: vi.fn(async () => undefined),
      clear: vi.fn(async () => undefined)
    },
    transaction: vi.fn(async (_mode, _a, _b, _c, scope: () => Promise<void>) => {
      await scope();
    }) as BackupDataSource["transaction"]
  };
}

describe("backup import/export", () => {
  it("exports all tables to json", async () => {
    const mockDb = createMockDb();
    const json = await exportBackup(mockDb);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe(1);
    expect(parsed.dailyLogs).toHaveLength(1);
    expect(parsed.weeklyCheckIns).toHaveLength(1);
    expect(parsed.workoutLogs).toHaveLength(1);
  });

  it("imports backup and merges into existing tables by default", async () => {
    const mockDb = createMockDb();
    const payload = await exportBackup(mockDb);

    await importBackup(payload, mockDb);

    expect(mockDb.dailyLogs.clear).not.toHaveBeenCalled();
    expect(mockDb.weeklyCheckIns.clear).not.toHaveBeenCalled();
    expect(mockDb.workoutLogs.clear).not.toHaveBeenCalled();
    expect(mockDb.dailyLogs.bulkPut).toHaveBeenCalledOnce();
    expect(mockDb.weeklyCheckIns.bulkPut).toHaveBeenCalledOnce();
    expect(mockDb.workoutLogs.bulkPut).toHaveBeenCalledOnce();
  });

  it("clears existing tables before import when overwrite mode is selected", async () => {
    const mockDb = createMockDb();
    const payload = await exportBackup(mockDb);

    await importBackup(payload, mockDb, { mode: "overwrite" });

    expect(mockDb.dailyLogs.clear).toHaveBeenCalledOnce();
    expect(mockDb.weeklyCheckIns.clear).toHaveBeenCalledOnce();
    expect(mockDb.workoutLogs.clear).toHaveBeenCalledOnce();
    expect(mockDb.dailyLogs.bulkPut).toHaveBeenCalledOnce();
    expect(mockDb.weeklyCheckIns.bulkPut).toHaveBeenCalledOnce();
    expect(mockDb.workoutLogs.bulkPut).toHaveBeenCalledOnce();
  });
});
