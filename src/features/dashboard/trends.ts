import { addDays, calculateWeeklyAdherence, calculateWeeklyWorkoutProgress } from "@/domain/calc";
import type { DailyLog, WeeklyCheckIn, WeeklyTrendPoint, WorkoutLog } from "@/domain/types";
import type { TranslationDict } from "@/i18n/types";

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

export type DashboardActionText = Pick<
  TranslationDict["dashboard"],
  | "nextActionLogEnergy"
  | "nextActionLogSleep"
  | "nextActionAddStrength"
  | "nextActionAddWalk"
  | "nextActionWeeklyCheckIn"
>;

const defaultDashboardActionText: DashboardActionText = {
  nextActionLogEnergy: (count) => `Logg energi for ${count} ${count === 1 ? "dag" : "dager"} til`,
  nextActionLogSleep: (count) => `Logg søvn for ${count} ${count === 1 ? "dag" : "dager"} til`,
  nextActionAddStrength: (count) =>
    `Mangler ${count} ${count === 1 ? "styrkeøkt" : "styrkeøkter"} denne uken`,
  nextActionAddWalk: (count) => `Mangler ${count} ${count === 1 ? "gåtur" : "gåturer"} denne uken`,
  nextActionWeeklyCheckIn: "Ukentlig veiing og refleksjon mangler"
};

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
  trendPoints: WeeklyTrendPoint[],
  todayIsoDate?: string,
  actionText: DashboardActionText = defaultDashboardActionText
): DashboardSnapshot {
  const adherence = calculateWeeklyAdherence(weekStartDate, dailyLogs, workouts, todayIsoDate);
  const weekEndDate = addDays(weekStartDate, 6);
  const workoutProgress = calculateWeeklyWorkoutProgress(weekStartDate, workouts);
  const weightLogged = weeklyCheckIns.some((item) => item.weekStartDate === weekStartDate);

  const isCurrentWeek =
    typeof todayIsoDate === "string" && todayIsoDate >= weekStartDate && todayIsoDate <= weekEndDate;
  const daysElapsed = isCurrentWeek
    ? Math.min(
        7,
        Math.floor(
          (new Date(`${todayIsoDate}T00:00:00.000Z`).getTime() - new Date(`${weekStartDate}T00:00:00.000Z`).getTime()) /
            86_400_000
        ) + 1
      )
    : 7;

  const missingEnergyDays = Math.max(0, daysElapsed - adherence.energyDays);
  const missingSleepDays = Math.max(0, daysElapsed - adherence.sleepDays);

  const recentWorkouts = [...workouts].sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1)).slice(0, 6);

  const actions: string[] = [];
  if (missingEnergyDays > 0) {
    actions.push(actionText.nextActionLogEnergy(missingEnergyDays));
  }
  if (missingSleepDays > 0) {
    actions.push(actionText.nextActionLogSleep(missingSleepDays));
  }
  if (workoutProgress.remainingStrengthWorkouts > 0) {
    actions.push(actionText.nextActionAddStrength(workoutProgress.remainingStrengthWorkouts));
  }
  if (workoutProgress.remainingWalks > 0) {
    actions.push(actionText.nextActionAddWalk(workoutProgress.remainingWalks));
  }
  if (!weightLogged) {
    actions.push(actionText.nextActionWeeklyCheckIn);
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
