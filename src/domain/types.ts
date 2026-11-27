export type WorkoutType = "strength" | "walk";
export type HealthStatus = "green" | "yellow" | "red";

export interface ManualTimerSettings {
  activitySeconds: number;
  restSeconds: number;
  rounds: number;
}

export interface ManualTimerState {
  phase: "ready" | "activity" | "rest" | "complete";
  remainingMs: number;
  completedRounds: number;
}

export interface TimedSequenceStep {
  readonly name: string;
  readonly kind: "activity" | "rest";
  readonly durationMs: number;
}

export interface TimedSequenceDefinition {
  readonly steps: readonly TimedSequenceStep[];
  readonly repetitions: number;
  readonly omitFinalRest: boolean;
}

export interface TimedSequence extends TimedSequenceDefinition {
  readonly cycleDurationMs: number;
  readonly totalDurationMs: number;
}

export type TimedSequenceState =
  | {
      readonly phase: "running";
      readonly elapsedMs: number;
      readonly remainingMs: number;
      readonly repetitionIndex: number;
      readonly stepIndex: number;
      readonly step: TimedSequenceStep;
    }
  | {
      readonly phase: "complete";
      readonly elapsedMs: number;
      readonly remainingMs: 0;
    };

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
