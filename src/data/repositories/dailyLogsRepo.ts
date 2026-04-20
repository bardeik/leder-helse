import { db } from "@/data/db";
import type { DailyLog } from "@/domain/types";
import { validateDailyLog } from "@/domain/validation";

export const dailyLogsRepo = {
  async upsert(input: DailyLog): Promise<void> {
    const log = validateDailyLog(input);
    await db.dailyLogs.put(log);
  },

  async get(date: string): Promise<DailyLog | undefined> {
    return db.dailyLogs.get(date);
  },

  async listByRange(startDate: string, endDate: string): Promise<DailyLog[]> {
    return db.dailyLogs.where("date").between(startDate, endDate, true, true).toArray();
  },

  async delete(date: string): Promise<void> {
    await db.dailyLogs.delete(date);
  }
};
