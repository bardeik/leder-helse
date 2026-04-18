import Dexie, { type Table } from "dexie";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";

export class LeaderHealthDb extends Dexie {
  dailyLogs!: Table<DailyLog, string>;
  weeklyCheckIns!: Table<WeeklyCheckIn, string>;
  workoutLogs!: Table<WorkoutLog, number>;

  constructor() {
    super("leader-health-loop");

    this.version(1).stores({
      dailyLogs: "&date",
      weeklyCheckIns: "&weekStartDate",
      workoutLogs: "++id,date,dateTime,type"
    });
  }
}

export const db = new LeaderHealthDb();
