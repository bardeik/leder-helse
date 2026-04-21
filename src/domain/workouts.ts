import type { WorkoutType } from "@/domain/types";

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

export function formatWorkoutType(type: WorkoutType): string {
  return type === "strength" ? "Styrkeøkt" : "Gåtur";
}
