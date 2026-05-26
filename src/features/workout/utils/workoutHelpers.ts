import type { WorkoutExercise } from "@/features/workout/data/exercises";

/**
 * Converts seconds to a timer-friendly mm:ss string.
 */
export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Calculates rounded workout progress in percent.
 */
export function calculateProgress(completedSteps: number, totalSteps: number): number {
  if (totalSteps <= 0) {
    return 0;
  }

  const ratio = Math.min(1, Math.max(0, completedSteps / totalSteps));
  return Math.round(ratio * 100);
}

/**
 * Returns true when the exercise is the last in the round.
 */
export function isLastExerciseInRound(currentExercise: number, exercisesPerRound: number): boolean {
  return currentExercise >= exercisesPerRound;
}

/**
 * Returns true when the round is the final workout round.
 */
export function isLastRound(currentRound: number, totalRounds: number): boolean {
  return currentRound >= totalRounds;
}

/**
 * Returns the next exercise in the same round, if available.
 */
export function getNextExercise(
  currentExercise: number,
  exerciseList: WorkoutExercise[]
): WorkoutExercise | undefined {
  return exerciseList[currentExercise];
}
