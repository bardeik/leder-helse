import { useTranslation } from "@/i18n/LanguageProvider";
import type { WorkoutExercise } from "@/features/workout/data/exercises";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  status: "active" | "completed" | "upcoming";
}

export function ExerciseCard({ exercise, status }: ExerciseCardProps) {
  const { translations: t } = useTranslation();

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
        aria-label={t.workout.watchVideoAria(exercise.name)}
      >
        {t.workout.watchVideo}
      </a>
    </li>
  );
}
