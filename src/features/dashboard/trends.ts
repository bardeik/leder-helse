import {
  addDays,
  calculateWeeklyAdherence,
  calculateWeeklyWorkoutProgress
} from "@/domain/calc";
import type { DailyLog, WeeklyCheckIn, WeeklyTrendPoint, WorkoutLog } from "@/domain/types";

export interface DashboardWeekSummary {
  energyDays: number;
  sleepDays: number;
  strengthWorkouts: number;
  walks: number;
  weightLogged: boolean;
  missingEnergyDays: number;
  missingSleepDays: number;
  remainingStrengthWorkouts: number;
  remainingWalks: number;
}

export interface DashboardMetricHighlight {
  currentValue?: number;
  delta?: number;
}

export interface DashboardTrendHighlights {
  weight: DashboardMetricHighlight;
  energy: DashboardMetricHighlight;
  sleep: DashboardMetricHighlight;
}

export interface DashboardSnapshot {
  adherencePercent: number;
  status: "green" | "yellow" | "red";
  recentWorkouts: WorkoutLog[];
  nextActions: string[];
  weekSummary: DashboardWeekSummary;
  latestCheckIn?: WeeklyCheckIn;
  trendHighlights: DashboardTrendHighlights;
}

function roundDelta(value: number, fractionDigits: number): number {
  const precision = 10 ** fractionDigits;
  return Math.round(value * precision) / precision;
}

function getMetricHighlight(
  trendPoints: WeeklyTrendPoint[],
  currentIndex: number,
  selector: (point: WeeklyTrendPoint) => number | undefined,
  fractionDigits: number
): DashboardMetricHighlight {
  const currentPoint = trendPoints[currentIndex];
  if (!currentPoint) {
    return {};
  }

  const currentValue = selector(currentPoint);

  if (typeof currentValue !== "number") {
    return {};
  }

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const previousValue = selector(trendPoints[index] ?? {});
    if (typeof previousValue === "number") {
      return {
        currentValue,
        delta: roundDelta(currentValue - previousValue, fractionDigits)
      };
    }
  }

  return { currentValue };
}

export function getDashboardSnapshot(
  weekStartDate: string,
  dailyLogs: DailyLog[],
  weeklyCheckIns: WeeklyCheckIn[],
  workouts: WorkoutLog[],
  trendPoints: WeeklyTrendPoint[]
): DashboardSnapshot {
  const adherence = calculateWeeklyAdherence(weekStartDate, dailyLogs, workouts);
  const weekEndDate = addDays(weekStartDate, 6);
  const workoutProgress = calculateWeeklyWorkoutProgress(weekStartDate, workouts);
  const weightLogged = weeklyCheckIns.some((item) => item.weekStartDate === weekStartDate);
  const missingEnergyDays = Math.max(0, 7 - adherence.energyDays);
  const missingSleepDays = Math.max(0, 7 - adherence.sleepDays);

  const recentWorkouts = [...workouts]
    .sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1))
    .slice(0, 6);

  const actions: string[] = [];
  if (missingEnergyDays > 0) {
    actions.push(`Logg energi for ${missingEnergyDays} ${missingEnergyDays === 1 ? "dag" : "dager"} til`);
  }
  if (missingSleepDays > 0) {
    actions.push(`Logg søvn for ${missingSleepDays} ${missingSleepDays === 1 ? "dag" : "dager"} til`);
  }
  if (workoutProgress.remainingStrengthWorkouts > 0) {
    actions.push(
      `Mangler ${workoutProgress.remainingStrengthWorkouts} ${
        workoutProgress.remainingStrengthWorkouts === 1 ? "styrkeøkt" : "styrkeøkter"
      } denne uken`
    );
  }
  if (workoutProgress.remainingWalks > 0) {
    actions.push(
      `Mangler ${workoutProgress.remainingWalks} ${
        workoutProgress.remainingWalks === 1 ? "gåtur" : "gåturer"
      } denne uken`
    );
  }
  if (!weightLogged) {
    actions.push("Ukentlig veiing og refleksjon mangler");
  }

  const latestCheckIn = [...weeklyCheckIns].sort((a, b) => (a.weekStartDate < b.weekStartDate ? 1 : -1))[0];
  const matchedTrendIndex = trendPoints.findIndex((item) => item.weekStartDate === weekStartDate);
  const currentTrendIndex = matchedTrendIndex >= 0 ? matchedTrendIndex : Math.max(0, trendPoints.length - 1);

  return {
    adherencePercent: adherence.adherencePercent,
    status: adherence.status,
    recentWorkouts,
    nextActions: actions,
    weekSummary: {
      energyDays: adherence.energyDays,
      sleepDays: adherence.sleepDays,
      strengthWorkouts: workoutProgress.strengthWorkouts,
      walks: workoutProgress.walks,
      weightLogged,
      missingEnergyDays,
      missingSleepDays,
      remainingStrengthWorkouts: workoutProgress.remainingStrengthWorkouts,
      remainingWalks: workoutProgress.remainingWalks
    },
    latestCheckIn,
    trendHighlights: {
      weight: getMetricHighlight(trendPoints, currentTrendIndex, (point) => point.weightKg, 1),
      energy: getMetricHighlight(trendPoints, currentTrendIndex, (point) => point.energyAverage, 1),
      sleep: getMetricHighlight(trendPoints, currentTrendIndex, (point) => point.sleepOkCount, 0)
    }
  };
}
