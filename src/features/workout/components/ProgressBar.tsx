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
      <progress className="workout-progress-native" aria-label="Fremdrift i prosent" value={progressPercent} max={100} />
    </section>
  );
}
