import { useTranslation } from "@/i18n/LanguageProvider";

interface WorkoutHeaderProps {
  title: string;
  description: string;
}

export function WorkoutHeader({ title, description }: WorkoutHeaderProps) {
  const { translations: t } = useTranslation();

  return (
    <header className="workout-header card">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="workout-article-link">
        <a
          href="https://www.fvn.no/aktuelt/sprek/i/5pLnwm/fysiologens-favorittoekt-et-enkelt-og-effektivt-styrkeprogram-som-trener-hele-kroppen-paa-45-minutter"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.workout.articleLinkText}
        </a>
      </p>
      <h2>{t.workout.warmupTitle}</h2>
      <p>
        {t.workout.warmupDescription}
      </p>
      <small className="muted">
        {t.workout.formReminder}
      </small>
    </header>
  );
}
