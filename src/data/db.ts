import Dexie, { type Table } from "dexie";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";

export class LeaderHealthDb extends Dexie {
  dailyLogs!: Table<DailyLog, string>;
  weeklyCheckIns!: Table<WeeklyCheckIn, string>;
  workoutLogs!: Table<WorkoutLog, number>;

  constructor() {
    super("leader-health-loop");

    // Version 2 is the current baseline. Version 1 (which had a data migration
    // normalising legacy workout types strengthA/strengthB → strength) is no
    // longer declared because no users remain on that schema. The IDB version
    // number must stay at 2 so existing databases open without a VersionError.
    this.version(2).stores({
      dailyLogs: "&date",
      weeklyCheckIns: "&weekStartDate",
      workoutLogs: "++id,date,dateTime,type"
    });

    // When another tab upgrades the database to a newer version, release this
    // connection so the upgrade can proceed, then reload to pick up the new code.
    this.on("versionchange", () => {
      this.close();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
  }
}

export const db = new LeaderHealthDb();
