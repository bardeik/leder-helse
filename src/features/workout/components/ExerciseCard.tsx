import type { WorkoutExercise } from "@/features/workout/data/exercises";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  status: "active" | "completed" | "upcoming";
}

export function ExerciseCard({ exercise, status }: ExerciseCardProps) {
  return (
    <li className={`workout-exercise-card ${status}`}>
      <p className="workout-exercise-title">
        {exercise.id}. {exercise.name}
      </p>
      <p className="workout-exercise-description">{exercise.description}</p>
    </li>
  );
}
