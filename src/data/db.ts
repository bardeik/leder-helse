import Dexie, { type Table } from "dexie";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";
import { normalizeWorkoutType } from "@/domain/workouts";

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

    this.version(2)
      .stores({
        dailyLogs: "&date",
        weeklyCheckIns: "&weekStartDate",
        workoutLogs: "++id,date,dateTime,type"
      })
      .upgrade((tx) =>
        tx
          .table("workoutLogs")
          .toCollection()
          .modify((item: { type?: string }) => {
            const normalizedType = normalizeWorkoutType(String(item.type ?? ""));
            if (normalizedType) {
              item.type = normalizedType;
            }
          })
      );
  }
}

export const db = new LeaderHealthDb();
