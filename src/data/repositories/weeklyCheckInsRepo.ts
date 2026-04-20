import { db } from "@/data/db";
import type { WeeklyCheckIn } from "@/domain/types";
import { validateWeeklyCheckIn } from "@/domain/validation";

export const weeklyCheckInsRepo = {
  async upsert(input: WeeklyCheckIn): Promise<void> {
    const item = validateWeeklyCheckIn(input);
    await db.weeklyCheckIns.put(item);
  },

  async get(weekStartDate: string): Promise<WeeklyCheckIn | undefined> {
    return db.weeklyCheckIns.get(weekStartDate);
  },

  async listByRange(startDate: string, endDate: string): Promise<WeeklyCheckIn[]> {
    return db.weeklyCheckIns.where("weekStartDate").between(startDate, endDate, true, true).sortBy("weekStartDate");
  },

  async delete(weekStartDate: string): Promise<void> {
    await db.weeklyCheckIns.delete(weekStartDate);
  }
};
