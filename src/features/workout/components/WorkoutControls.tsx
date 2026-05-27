import { useTranslation } from "@/i18n/LanguageProvider";

interface WorkoutControlsProps {
  isRunning: boolean;
  isWorkoutComplete: boolean;
  muted: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleMute: () => void;
}

export function WorkoutControls({
  isRunning,
  isWorkoutComplete,
  muted,
  onStart,
  onPause,
  onReset,
  onToggleMute
}: WorkoutControlsProps) {
  const { translations: t } = useTranslation();

  return (
    <section className="card">
      <h2>{t.workout.controlsTitle}</h2>
      <div className="workout-controls">
        <button className="primary" type="button" onClick={onStart} disabled={isRunning || isWorkoutComplete}>
          {t.workout.start}
        </button>
        <button className="secondary" type="button" onClick={onPause} disabled={!isRunning || isWorkoutComplete}>
          {t.workout.pause}
        </button>
        <button className="secondary" type="button" onClick={onReset}>
          {t.workout.reset}
        </button>
        <button
          className="secondary workout-mute-btn"
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? t.workout.unmuteLabel : t.workout.muteLabel}
          aria-pressed={muted}
          title={muted ? t.workout.soundOff : t.workout.soundOn}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </section>
  );
}
