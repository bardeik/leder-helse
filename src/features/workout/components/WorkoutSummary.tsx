interface WorkoutSummaryProps {
  completedRounds: number;
  totalCompletedSteps: number;
  onRestart: () => void;
}

export function WorkoutSummary({ completedRounds, totalCompletedSteps, onRestart }: WorkoutSummaryProps) {
  return (
    <section className="card workout-summary" aria-live="polite">
      <h2>Økten er fullført!</h2>
      <p>Bra jobba! Du har gjennomført hele intervalløkten.</p>
      <p>
        {completedRounds} runder fullført, {totalCompletedSteps} intervaller gjennomført.
      </p>
      <button className="primary" type="button" onClick={onRestart}>
        Start på nytt
      </button>
    </section>
  );
}
