import type {
  DailyLog,
  HealthStatus,
  WeeklyAdherence,
  WeeklyCheckIn,
  WeeklyTrendPoint,
  WorkoutLog
} from "@/domain/types";

const MS_PER_DAY = 86_400_000;
export const WEEKLY_STRENGTH_GOAL = 2;
export const WEEKLY_WALK_GOAL = 5;
export const WEEKLY_WORKOUT_GOAL = WEEKLY_STRENGTH_GOAL + WEEKLY_WALK_GOAL;

export interface WeeklyWorkoutProgress {
  strengthWorkouts: number;
  walks: number;
  completedGoals: number;
  remainingStrengthWorkouts: number;
  remainingWalks: number;
  remainingGoals: number;
}

/** Returns Monday-based week start as ISO date. */
export function getWeekStartDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const localDate = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  const dayOfWeek = localDate.getUTCDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  localDate.setUTCDate(localDate.getUTCDate() + offsetToMonday);
  return localDate.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const shifted = new Date(date.getTime() + days * MS_PER_DAY);
  return shifted.toISOString().slice(0, 10);
}

export function getHealthStatus(adherencePercent: number): HealthStatus {
  if (adherencePercent >= 80) {
    return "green";
  }
  if (adherencePercent >= 50) {
    return "yellow";
  }
  return "red";
}

/** Calculates weekly workout progress against 2 strength sessions and 5 walks. */
export function calculateWeeklyWorkoutProgress(
  weekStartDate: string,
  workoutLogs: WorkoutLog[]
): WeeklyWorkoutProgress {
  const weekEndDate = addDays(weekStartDate, 6);
  const weekWorkouts = workoutLogs.filter((item) => item.date >= weekStartDate && item.date <= weekEndDate);
  const strengthWorkouts = weekWorkouts.filter((item) => item.type === "strength").length;
  const walks = weekWorkouts.filter((item) => item.type === "walk").length;
  const completedGoals = Math.min(strengthWorkouts, WEEKLY_STRENGTH_GOAL) + Math.min(walks, WEEKLY_WALK_GOAL);
  const remainingStrengthWorkouts = Math.max(0, WEEKLY_STRENGTH_GOAL - strengthWorkouts);
  const remainingWalks = Math.max(0, WEEKLY_WALK_GOAL - walks);

  return {
    strengthWorkouts,
    walks,
    completedGoals,
    remainingStrengthWorkouts,
    remainingWalks,
    remainingGoals: remainingStrengthWorkouts + remainingWalks
  };
}

/** Calculates weekly adherence from daily and workout logs.
 *  Pass `todayIsoDate` to prorate the denominator to elapsed days when inside the current week.
 */
export function calculateWeeklyAdherence(
  weekStartDate: string,
  dailyLogs: DailyLog[],
  workoutLogs: WorkoutLog[],
  todayIsoDate?: string
): WeeklyAdherence {
  const weekEndDate = addDays(weekStartDate, 6);
  const weekDailyLogs = dailyLogs.filter((item) => item.date >= weekStartDate && item.date <= weekEndDate);
  const workoutProgress = calculateWeeklyWorkoutProgress(weekStartDate, workoutLogs);

  const energyDays = weekDailyLogs.filter((item) => item.energy >= 1 && item.energy <= 5).length;
  const sleepDays = weekDailyLogs.filter((item) => typeof item.sleepOk === "boolean").length;
  const workouts = workoutProgress.completedGoals;

  const isCurrentWeek =
    typeof todayIsoDate === "string" && todayIsoDate >= weekStartDate && todayIsoDate <= weekEndDate;
  const daysElapsed = isCurrentWeek
    ? Math.min(
        7,
        Math.floor(
          (new Date(`${todayIsoDate}T00:00:00.000Z`).getTime() - new Date(`${weekStartDate}T00:00:00.000Z`).getTime()) /
            MS_PER_DAY
        ) + 1
      )
    : 7;

  const completed = energyDays + sleepDays + workouts;
  const total = daysElapsed + daysElapsed + WEEKLY_WORKOUT_GOAL;
  const adherencePercent = Math.round((completed / total) * 100);

  return {
    weekStartDate,
    energyDays,
    sleepDays,
    workouts,
    adherencePercent,
    status: getHealthStatus(adherencePercent)
  };
}

/** Builds 6-week trend points for weight, energy average, and sleep-ok count. */
export function buildWeeklyTrends(
  weekStartDates: string[],
  dailyLogs: DailyLog[],
  weeklyCheckIns: WeeklyCheckIn[]
): WeeklyTrendPoint[] {
  const weightByWeek = new Map(weeklyCheckIns.map((item) => [item.weekStartDate, item.weightKg]));

  return weekStartDates.map((weekStartDate, index) => {
    const weekEndDate = addDays(weekStartDate, 6);
    const weekDailyLogs = dailyLogs.filter((item) => item.date >= weekStartDate && item.date <= weekEndDate);

    const energyValues = weekDailyLogs.map((item) => item.energy);
    const energyAverage =
      energyValues.length > 0
        ? Math.round((energyValues.reduce((sum, value) => sum + value, 0) / energyValues.length) * 10) / 10
        : undefined;

    const currentWeight = weightByWeek.get(weekStartDate);
    const previousWeight = index > 0 ? weightByWeek.get(weekStartDates[index - 1] ?? "") : undefined;

    return {
      weekStartDate,
      weightKg: currentWeight,
      weightDeltaKg:
        typeof currentWeight === "number" && typeof previousWeight === "number"
          ? Math.round((currentWeight - previousWeight) * 10) / 10
          : undefined,
      energyAverage,
      sleepOkCount: weekDailyLogs.filter((item) => item.sleepOk).length
    };
  });
}

export function getRecentWeekStarts(fromIsoDate: string, count = 6): string[] {
  const currentWeekStart = getWeekStartDate(fromIsoDate);
  return Array.from({ length: count }, (_, i) => addDays(currentWeekStart, (i - (count - 1)) * 7));
}
