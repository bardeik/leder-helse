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
    actions.push("Strength A tomorrow morning 07:15");
  }
  if (!workouts.some((item) => item.type === "strengthB" && item.date >= weekStartDate)) {
    actions.push("Strength B in 2 days 07:15");
  }
  if (!workouts.some((item) => item.type === "walk" && item.date >= weekStartDate)) {
    actions.push("Walk 20-30m this afternoon");
  }
  if (weeklyCheckIns.length === 0) {
    actions.push("Do your weekly weigh-in");
  }

  return {
    adherencePercent: adherence.adherencePercent,
    status: adherence.status,
    recentWorkouts,
    nextActions: actions
  };
}
