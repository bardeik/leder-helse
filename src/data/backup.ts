import { db } from "@/data/db";
import { backupSchema } from "@/domain/schemas";

export interface BackupDataSource {
  dailyLogs: { toArray: () => Promise<unknown[]>; bulkPut: (...args: unknown[]) => Promise<unknown>; clear: () => Promise<unknown> };
  weeklyCheckIns: { toArray: () => Promise<unknown[]>; bulkPut: (...args: unknown[]) => Promise<unknown>; clear: () => Promise<unknown> };
  workoutLogs: { toArray: () => Promise<unknown[]>; bulkPut: (...args: unknown[]) => Promise<unknown>; clear: () => Promise<unknown> };
  transaction: (mode: "rw", ...tablesAndScope: unknown[]) => Promise<unknown>;
}

export interface StorageSummary {
  dailyLogs: number;
  weeklyCheckIns: number;
  workoutLogs: number;
}

export type BackupImportMode = "merge" | "overwrite";

export async function exportBackup(source: BackupDataSource = db as unknown as BackupDataSource): Promise<string> {
  const backup = {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    dailyLogs: await source.dailyLogs.toArray(),
    weeklyCheckIns: await source.weeklyCheckIns.toArray(),
    workoutLogs: await source.workoutLogs.toArray()
  };

  const validated = backupSchema.parse(backup);
  return JSON.stringify(validated, null, 2);
}

export async function importBackup(
  json: string,
  source: BackupDataSource = db as unknown as BackupDataSource,
  options: { mode?: BackupImportMode } = {}
): Promise<void> {
  const parsed = backupSchema.parse(JSON.parse(json));
  const mode = options.mode ?? "merge";

  await source.transaction("rw", source.dailyLogs, source.weeklyCheckIns, source.workoutLogs, async () => {
    if (mode === "overwrite") {
      await source.dailyLogs.clear();
      await source.weeklyCheckIns.clear();
      await source.workoutLogs.clear();
    }

    await source.dailyLogs.bulkPut(parsed.dailyLogs);
    await source.weeklyCheckIns.bulkPut(parsed.weeklyCheckIns);
    await source.workoutLogs.bulkPut(parsed.workoutLogs);
  });
}

export async function getStorageSummary(
  source: BackupDataSource = db as unknown as BackupDataSource
): Promise<StorageSummary> {
  const [dailyLogs, weeklyCheckIns, workoutLogs] = await Promise.all([
    source.dailyLogs.toArray(),
    source.weeklyCheckIns.toArray(),
    source.workoutLogs.toArray()
  ]);

  return {
    dailyLogs: dailyLogs.length,
    weeklyCheckIns: weeklyCheckIns.length,
    workoutLogs: workoutLogs.length
  };
}
