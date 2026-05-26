interface WorkoutSummaryProps {
  completedRounds: number;
  totalCompletedSteps: number;
  onRestart: () => void;
}

export function WorkoutSummary({ completedRounds, totalCompletedSteps, onRestart }: WorkoutSummaryProps) {
  return (
    <section className="card workout-summary" aria-live="polite">
      <h2>Okten er fullfort!</h2>
      <p>Bra jobba! Du har gjennomfort hele intervallokten.</p>
      <p>
        {completedRounds} runder fullfort, {totalCompletedSteps} intervaller gjennomfort.
      </p>
      <button className="primary" type="button" onClick={onRestart}>
        Start pa nytt
      </button>
    </section>
  );
}
