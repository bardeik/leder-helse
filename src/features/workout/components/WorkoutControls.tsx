interface WorkoutControlsProps {
  isRunning: boolean;
  isWorkoutComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function WorkoutControls({ isRunning, isWorkoutComplete, onStart, onPause, onReset }: WorkoutControlsProps) {
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
      </div>
    </section>
  );
}
