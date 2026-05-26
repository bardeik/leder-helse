interface ProgressBarProps {
  totalCompletedSteps: number;
  totalSteps: number;
  progressPercent: number;
}

export function ProgressBar({ totalCompletedSteps, totalSteps, progressPercent }: ProgressBarProps) {
  return (
    <section className="card">
      <h2>Fremdrift</h2>
      <p className="workout-progress-text">
        {totalCompletedSteps} / {totalSteps} ovelser fullfort ({progressPercent}%)
      </p>
      <div className="workout-progress-track" aria-label="Fremdrift i prosent">
        <div className="workout-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </section>
  );
}
