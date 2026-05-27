import { useTranslation } from "@/i18n/LanguageProvider";
import type { WorkoutPhase } from "@/features/workout/utils/workoutConfig";
import { formatTime } from "@/features/workout/utils/workoutHelpers";

interface TimerDisplayProps {
  timeRemaining: number;
  phase: WorkoutPhase;
  currentRound: number;
  currentExercise: number;
}

export function TimerDisplay({ timeRemaining, phase, currentRound, currentExercise }: TimerDisplayProps) {
  const { translations: t } = useTranslation();
  const isCountdown = phase === "countdown";
  // Show a big plain digit during the startup countdown for maximum clarity
  const timeLabel = isCountdown ? String(timeRemaining) : formatTime(timeRemaining);

  return (
    <section className="workout-timer card" aria-live="polite">
      <p className={`workout-phase workout-phase-${phase}`}>{t.workout.phase[phase]}</p>
      <p className={`workout-time${isCountdown ? " workout-time-countdown" : ""}`}>{timeLabel}</p>
      <p className="workout-meta">{isCountdown ? t.workout.getReady : t.workout.roundExercise(currentRound, currentExercise)}</p>
    </section>
  );
}
