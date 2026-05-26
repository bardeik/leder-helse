interface WorkoutHeaderProps {
  title: string;
  description: string;
}

export function WorkoutHeader({ title, description }: WorkoutHeaderProps) {
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
          Les artikkelen: Fysiologens favorittøkt (fvn.no) ↗
        </a>
      </p>
      <h2>Oppvarming</h2>
      <p>
        8-10 minutter før hoveddelen. Eksempler: rask gange, lette knebøy, gående utfall og jumping jacks.
      </p>
      <small className="muted">
        Utfør hver repetisjon med god holdning, aktiv kjernemuskulatur og kontrollert bevegelse.
      </small>
    </header>
  );
}
