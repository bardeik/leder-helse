import { db } from "@/data/db";
import { weeklyCheckInSchema } from "@/domain/schemas";
import type { WeeklyCheckIn } from "@/domain/types";

export const weeklyCheckInsRepo = {
  async upsert(input: WeeklyCheckIn): Promise<void> {
    const item = weeklyCheckInSchema.parse(input);
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
