import { useTranslation } from "@/i18n/LanguageProvider";

interface ProgressBarProps {
  totalCompletedSteps: number;
  totalSteps: number;
  progressPercent: number;
}

export function ProgressBar({ totalCompletedSteps, totalSteps, progressPercent }: ProgressBarProps) {
  const { translations: t } = useTranslation();

  return (
    <section className="card">
      <h2>{t.workout.progressTitle}</h2>
      <p className="workout-progress-text">
        {t.workout.progressText(totalCompletedSteps, totalSteps, progressPercent)}
      </p>
      <progress className="workout-progress-native" aria-label={t.workout.progressAriaLabel} value={progressPercent} max={100} />
    </section>
  );
}
