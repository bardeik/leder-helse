import { PHASE_LABELS, type WorkoutPhase } from "@/features/workout/utils/workoutConfig";
import { formatTime } from "@/features/workout/utils/workoutHelpers";

interface TimerDisplayProps {
  timeRemaining: number;
  phase: WorkoutPhase;
  currentRound: number;
  currentExercise: number;
}

export function TimerDisplay({ timeRemaining, phase, currentRound, currentExercise }: TimerDisplayProps) {
  const isCountdown = phase === "countdown";
  // Show a big plain digit during the startup countdown for maximum clarity
  const timeLabel = isCountdown ? String(timeRemaining) : formatTime(timeRemaining);

  return (
    <section className="workout-timer card" aria-live="polite">
      <p className={`workout-phase workout-phase-${phase}`}>{PHASE_LABELS[phase]}</p>
      <p className={`workout-time${isCountdown ? " workout-time-countdown" : ""}`}>{timeLabel}</p>
      <p className="workout-meta">
        {isCountdown ? "Gjør deg klar..." : `Runde ${currentRound} - Øvelse ${currentExercise}`}
      </p>
    </section>
  );
}
