import type { BackupData, DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";
import { normalizeWorkoutType } from "@/domain/workouts";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, message: string): asserts value is string {
  assert(typeof value === "string", message);
}

function assertOptionalString(value: unknown, maxLength: number, message: string) {
  if (value === undefined) {
    return;
  }

  assert(typeof value === "string", message);
  assert(value.length <= maxLength, message);
}

function assertIsoDate(value: unknown, message: string): asserts value is string {
  assertString(value, message);
  assert(ISO_DATE_PATTERN.test(value), message);
}

function assertIsoTimestamp(value: unknown, message: string): asserts value is string {
  assertString(value, message);
  assert(value.includes("T") && !Number.isNaN(Date.parse(value)), message);
}

function assertPositiveNumber(value: unknown, max: number, message: string): asserts value is number {
  assert(typeof value === "number" && Number.isFinite(value) && value > 0 && value <= max, message);
}

function parseDailyLog(input: unknown): DailyLog {
  assert(isRecord(input), "Daglig logg må være et objekt.");

  const log: DailyLog = {
    date: input.date as string,
    energy: input.energy as number,
    sleepOk: input.sleepOk as boolean
  };

  if ("sleepHours" in input) {
    log.sleepHours = input.sleepHours as number | undefined;
  }
  if ("notes" in input) {
    log.notes = input.notes as string | undefined;
  }

  return validateDailyLog(log);
}

function parseWeeklyCheckIn(input: unknown): WeeklyCheckIn {
  assert(isRecord(input), "Ukentlig innsjekk må være et objekt.");

  const checkIn: WeeklyCheckIn = {
    weekStartDate: input.weekStartDate as string,
    weightKg: input.weightKg as number
  };

  if ("notes" in input) {
    checkIn.notes = input.notes as string | undefined;
  }
  if ("adjustment" in input) {
    checkIn.adjustment = input.adjustment as string | undefined;
  }

  return validateWeeklyCheckIn(checkIn);
}

function parseWorkoutLog(input: unknown): WorkoutLog {
  assert(isRecord(input), "Aktivitetslogg må være et objekt.");
  const normalizedType = normalizeWorkoutType(String(input.type ?? ""));
  assert(normalizedType, "Aktivitetstype er ugyldig.");

  const workout: WorkoutLog = {
    dateTime: input.dateTime as string,
    date: input.date as string,
    type: normalizedType
  };

  if ("id" in input) {
    workout.id = input.id as number | undefined;
  }
  if ("durationMin" in input) {
    workout.durationMin = input.durationMin as number | undefined;
  }
  if ("notes" in input) {
    workout.notes = input.notes as string | undefined;
  }

  return validateWorkoutLog(workout);
}

/** Validates a daily log object and returns it when the shape is valid. */
export function validateDailyLog(input: DailyLog): DailyLog {
  assertIsoDate(input.date, "Dato må være på formatet YYYY-MM-DD.");
  assert(Number.isInteger(input.energy) && input.energy >= 1 && input.energy <= 5, "Energi må være et heltall mellom 1 og 5.");
  assert(typeof input.sleepOk === "boolean", "Søvnstatus må være satt.");

  if (input.sleepHours !== undefined) {
    assertPositiveNumber(input.sleepHours, 24, "Søvntimer må være et tall mellom 0 og 24.");
  }

  assertOptionalString(input.notes, 1000, "Notat er for langt.");
  return input;
}

/** Validates a weekly check-in object and returns it when the shape is valid. */
export function validateWeeklyCheckIn(input: WeeklyCheckIn): WeeklyCheckIn {
  assertIsoDate(input.weekStartDate, "Ukesdato må være på formatet YYYY-MM-DD.");
  assertPositiveNumber(input.weightKg, 400, "Vekt må være et tall mellom 0 og 400.");
  assertOptionalString(input.notes, 1000, "Notat er for langt.");
  assertOptionalString(input.adjustment, 280, "Justering er for lang.");
  return input;
}

/** Validates a workout log object and returns it when the shape is valid. */
export function validateWorkoutLog(input: WorkoutLog): WorkoutLog {
  assertIsoTimestamp(input.dateTime, "Tidspunkt må være en ISO-tidsstreng.");
  assertIsoDate(input.date, "Dato må være på formatet YYYY-MM-DD.");
  assert(normalizeWorkoutType(input.type) !== undefined, "Aktivitetstype er ugyldig.");

  if (input.id !== undefined) {
    assert(Number.isInteger(input.id) && input.id > 0, "Id må være et positivt heltall.");
  }
  if (input.durationMin !== undefined) {
    assert(
      Number.isInteger(input.durationMin) && input.durationMin > 0 && input.durationMin <= 300,
      "Varighet må være et heltall mellom 1 og 300."
    );
  }

  assertOptionalString(input.notes, 1000, "Notat er for langt.");
  return input;
}

/** Parses and validates backup JSON data without bringing Zod into the client bundle. */
export function parseBackupData(input: unknown): BackupData {
  assert(isRecord(input), "Sikkerhetskopi må være et objekt.");
  assert(input.version === 1, "Kun sikkerhetskopier med versjon 1 støttes.");
  assertIsoTimestamp(input.exportedAt, "Eksporttidspunkt må være en ISO-tidsstreng.");
  assert(Array.isArray(input.dailyLogs), "Daglige logger må være en liste.");
  assert(Array.isArray(input.weeklyCheckIns), "Ukentlige innsjekker må være en liste.");
  assert(Array.isArray(input.workoutLogs), "Aktiviteter må være en liste.");

  return {
    version: 1,
    exportedAt: input.exportedAt,
    dailyLogs: input.dailyLogs.map(parseDailyLog),
    weeklyCheckIns: input.weeklyCheckIns.map(parseWeeklyCheckIn),
    workoutLogs: input.workoutLogs.map(parseWorkoutLog)
  };
}
