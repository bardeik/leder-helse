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
  return (
    <section className="card">
      <h2>Kontroller</h2>
      <div className="workout-controls">
        <button className="primary" type="button" onClick={onStart} disabled={isRunning || isWorkoutComplete}>
          Start
        </button>
        <button className="secondary" type="button" onClick={onPause} disabled={!isRunning || isWorkoutComplete}>
          Pause
        </button>
        <button className="secondary" type="button" onClick={onReset}>
          Reset
        </button>
        <button
          className="secondary workout-mute-btn"
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Skru på lyd" : "Skru av lyd"}
          aria-pressed={muted}
          title={muted ? "Lyd av" : "Lyd på"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </section>
  );
}
