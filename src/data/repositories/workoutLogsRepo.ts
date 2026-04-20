import { db } from "@/data/db";
import type { WorkoutLog } from "@/domain/types";
import { validateWorkoutLog } from "@/domain/validation";

export const workoutLogsRepo = {
  async upsert(input: WorkoutLog): Promise<number> {
    const log = validateWorkoutLog(input);
    return db.workoutLogs.put(log);
  },

  async listByDate(date: string): Promise<WorkoutLog[]> {
    return db.workoutLogs.where("date").equals(date).reverse().sortBy("dateTime");
  },

  async get(id: number): Promise<WorkoutLog | undefined> {
    return db.workoutLogs.get(id);
  },

  async listByRange(startDate: string, endDate: string): Promise<WorkoutLog[]> {
    return db.workoutLogs.where("date").between(startDate, endDate, true, true).reverse().sortBy("dateTime");
  },

  async delete(id: number): Promise<void> {
    await db.workoutLogs.delete(id);
  }
};
