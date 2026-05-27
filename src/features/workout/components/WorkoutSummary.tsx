import { useTranslation } from "@/i18n/LanguageProvider";

interface WorkoutSummaryProps {
  completedRounds: number;
  totalCompletedSteps: number;
  onRestart: () => void;
}

export function WorkoutSummary({ completedRounds, totalCompletedSteps, onRestart }: WorkoutSummaryProps) {
  const { translations: t } = useTranslation();

  return (
    <section className="card workout-summary" aria-live="polite">
      <h2>{t.workout.summaryTitle}</h2>
      <p>{t.workout.summaryBody}</p>
      <p>{t.workout.summaryStats(completedRounds, totalCompletedSteps)}</p>
      <button className="primary" type="button" onClick={onRestart}>
        {t.workout.restart}
      </button>
    </section>
  );
}
