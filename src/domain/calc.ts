import type { DailyLog, HealthStatus, WeeklyAdherence, WeeklyCheckIn, WeeklyTrendPoint, WorkoutLog } from "@/domain/types";

const MS_PER_DAY = 86_400_000;

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

/** Calculates weekly adherence from daily and workout logs. */
export function calculateWeeklyAdherence(
  weekStartDate: string,
  dailyLogs: DailyLog[],
  workoutLogs: WorkoutLog[]
): WeeklyAdherence {
  const weekEndDate = addDays(weekStartDate, 6);
  const weekDailyLogs = dailyLogs.filter((item) => item.date >= weekStartDate && item.date <= weekEndDate);
  const weekWorkouts = workoutLogs.filter((item) => item.date >= weekStartDate && item.date <= weekEndDate);

  const energyDays = weekDailyLogs.filter((item) => item.energy >= 1 && item.energy <= 5).length;
  const sleepDays = weekDailyLogs.filter((item) => typeof item.sleepOk === "boolean").length;
  const workouts = weekWorkouts.length;

  const completed = energyDays + sleepDays + Math.min(workouts, 3);
  const total = 7 + 7 + 3;
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
