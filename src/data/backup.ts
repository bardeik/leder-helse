import { db } from "@/data/db";
import { MAX_BACKUP_JSON_BYTES, MAX_BACKUP_SIZE_LABEL } from "@/domain/backupLimits";
import { parseBackupData } from "@/domain/validation";

export interface BackupDataSource {
  dailyLogs: {
    toArray: () => Promise<unknown[]>;
    bulkPut: (...args: unknown[]) => Promise<unknown>;
    clear: () => Promise<unknown>;
  };
  weeklyCheckIns: {
    toArray: () => Promise<unknown[]>;
    bulkPut: (...args: unknown[]) => Promise<unknown>;
    clear: () => Promise<unknown>;
  };
  workoutLogs: {
    toArray: () => Promise<unknown[]>;
    bulkPut: (...args: unknown[]) => Promise<unknown>;
    clear: () => Promise<unknown>;
  };
  transaction: (mode: "rw", ...tablesAndScope: unknown[]) => Promise<unknown>;
}

export interface StorageSummary {
  dailyLogs: number;
  weeklyCheckIns: number;
  workoutLogs: number;
}

export type BackupImportMode = "merge" | "overwrite";

export interface BackupImportMessages {
  tooLarge: string;
  invalidJson: string;
}

const DEFAULT_BACKUP_IMPORT_MESSAGES: BackupImportMessages = {
  tooLarge: `Sikkerhetskopien er for stor. Maks størrelse er ${MAX_BACKUP_SIZE_LABEL}.`,
  invalidJson: "Sikkerhetskopien må være gyldig JSON."
};

function parseBackupJson(json: string, messages: BackupImportMessages): unknown {
  const jsonSizeBytes = new TextEncoder().encode(json).length;
  if (jsonSizeBytes > MAX_BACKUP_JSON_BYTES) {
    throw new Error(messages.tooLarge);
  }

  try {
    return JSON.parse(json);
  } catch {
    throw new Error(messages.invalidJson);
  }
}

export async function exportBackup(source: BackupDataSource = db as unknown as BackupDataSource): Promise<string> {
  const validated = parseBackupData({
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    dailyLogs: await source.dailyLogs.toArray(),
    weeklyCheckIns: await source.weeklyCheckIns.toArray(),
    workoutLogs: await source.workoutLogs.toArray()
  });
  return JSON.stringify(validated, null, 2);
}

export async function importBackup(
  json: string,
  source: BackupDataSource = db as unknown as BackupDataSource,
  options: { mode?: BackupImportMode; messages?: BackupImportMessages } = {}
): Promise<void> {
  const parsed = parseBackupData(parseBackupJson(json, options.messages ?? DEFAULT_BACKUP_IMPORT_MESSAGES));
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
