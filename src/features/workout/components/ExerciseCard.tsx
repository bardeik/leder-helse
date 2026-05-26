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
      <a
        className="workout-exercise-video-link"
        href={exercise.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Se video for ${exercise.name}`}
      >
        Se video ↗
      </a>
    </li>
  );
}
