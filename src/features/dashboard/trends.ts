import { calculateWeeklyAdherence } from "@/domain/calc";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";

export interface DashboardSnapshot {
  adherencePercent: number;
  status: "green" | "yellow" | "red";
  recentWorkouts: WorkoutLog[];
  nextActions: string[];
}

export function getDashboardSnapshot(
  weekStartDate: string,
  dailyLogs: DailyLog[],
  weeklyCheckIns: WeeklyCheckIn[],
  workouts: WorkoutLog[]
): DashboardSnapshot {
  const adherence = calculateWeeklyAdherence(weekStartDate, dailyLogs, workouts);

  const recentWorkouts = [...workouts]
    .sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1))
    .slice(0, 6);

  const actions: string[] = [];
  if (!workouts.some((item) => item.type === "strengthA" && item.date >= weekStartDate)) {
    actions.push("Styrke A i morgen tidlig kl. 07:15");
  }
  if (!workouts.some((item) => item.type === "strengthB" && item.date >= weekStartDate)) {
    actions.push("Styrke B om to dager kl. 07:15");
  }
  if (!workouts.some((item) => item.type === "walk" && item.date >= weekStartDate)) {
    actions.push("Gå tur 20-30 min i ettermiddag");
  }
  if (weeklyCheckIns.length === 0) {
    actions.push("Gjennomfør ukentlig veiing");
  }

  return {
    adherencePercent: adherence.adherencePercent,
    status: adherence.status,
    recentWorkouts,
    nextActions: actions
  };
}
