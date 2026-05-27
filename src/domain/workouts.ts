import type { WorkoutType } from "@/domain/types";
import type { Locale } from "@/i18n/types";

const LEGACY_STRENGTH_WORKOUT_TYPES = new Set(["strengthA", "strengthB"]);

export function isWorkoutType(value: string): value is WorkoutType {
  return value === "strength" || value === "walk";
}

export function normalizeWorkoutType(value: string): WorkoutType | undefined {
  if (isWorkoutType(value)) {
    return value;
  }

  if (LEGACY_STRENGTH_WORKOUT_TYPES.has(value)) {
    return "strength";
  }

  return undefined;
}

export function formatWorkoutType(type: WorkoutType, locale: Locale = "no"): string {
  if (locale === "en") {
    return type === "strength" ? "Strength workout" : "Walk";
  }

  return type === "strength" ? "Styrkeøkt" : "Gåtur";
}
