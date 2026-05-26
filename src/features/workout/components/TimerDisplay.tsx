import { PHASE_LABELS, type WorkoutPhase } from "@/features/workout/utils/workoutConfig";
import { formatTime } from "@/features/workout/utils/workoutHelpers";

interface TimerDisplayProps {
  timeRemaining: number;
  phase: WorkoutPhase;
  currentRound: number;
  currentExercise: number;
}

export function TimerDisplay({ timeRemaining, phase, currentRound, currentExercise }: TimerDisplayProps) {
  return (
    <section className="workout-timer card" aria-live="polite">
      <p className={`workout-phase workout-phase-${phase}`}>{PHASE_LABELS[phase]}</p>
      <p className="workout-time">{formatTime(timeRemaining)}</p>
      <p className="workout-meta">
        Runde {currentRound} - Ovelse {currentExercise}
      </p>
    </section>
  );
}
