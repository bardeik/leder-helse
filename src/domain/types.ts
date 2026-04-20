export type WorkoutType = "strengthA" | "strengthB" | "walk";
export type HealthStatus = "green" | "yellow" | "red";

export interface DailyLog {
  date: string;
  energy: number;
  sleepOk: boolean;
  sleepHours?: number;
  notes?: string;
}

export interface WeeklyCheckIn {
  weekStartDate: string;
  weightKg: number;
  notes?: string;
  adjustment?: string;
}

export interface WorkoutLog {
  id?: number;
  dateTime: string;
  date: string;
  type: WorkoutType;
  durationMin?: number;
  notes?: string;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  dailyLogs: DailyLog[];
  weeklyCheckIns: WeeklyCheckIn[];
  workoutLogs: WorkoutLog[];
}

export interface WeeklyAdherence {
  weekStartDate: string;
  energyDays: number;
  sleepDays: number;
  workouts: number;
  adherencePercent: number;
  status: HealthStatus;
}

export interface WeeklyTrendPoint {
  weekStartDate: string;
  weightKg?: number;
  weightDeltaKg?: number;
  energyAverage?: number;
  sleepOkCount: number;
}
