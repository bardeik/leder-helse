import type { WorkoutExercise } from "@/features/workout/data/exercises";
import { EXERCISES_PER_ROUND, type WorkoutPhase } from "@/features/workout/utils/workoutConfig";
import { ExerciseCard } from "@/features/workout/components/ExerciseCard";

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  currentRound: number;
  currentExercise: number;
  completedExercises: number;
  phase: WorkoutPhase;
  isWorkoutComplete: boolean;
}

function getCompletedInCurrentRound(completedExercises: number, currentRound: number, isWorkoutComplete: boolean): number {
  if (isWorkoutComplete) {
    return EXERCISES_PER_ROUND;
  }

  const offset = (currentRound - 1) * EXERCISES_PER_ROUND;
  return Math.min(EXERCISES_PER_ROUND, Math.max(0, completedExercises - offset));
}

export function ExerciseList({
  exercises,
  currentRound,
  currentExercise,
  completedExercises,
  phase,
  isWorkoutComplete
}: ExerciseListProps) {
  const completedInCurrentRound = getCompletedInCurrentRound(completedExercises, currentRound, isWorkoutComplete);

  return (
    <section className="card">
      <h2>Øvelser i runden</h2>
      <ul className="workout-exercise-list">
        {exercises.map((exercise) => {
          const isCompleted = exercise.id <= completedInCurrentRound;
          const isActive = !isWorkoutComplete && phase === "work" && exercise.id === currentExercise;

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              status={isCompleted ? "completed" : isActive ? "active" : "upcoming"}
            />
          );
        })}
      </ul>
    </section>
  );
}
