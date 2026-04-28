"use client";

import { WEEKLY_STRENGTH_GOAL, WEEKLY_WALK_GOAL } from "@/domain/calc";
import { formatLocalNumber } from "@/domain/localeNumber";
import { formatWorkoutType } from "@/domain/workouts";
import type { WeeklyTrendPoint, WorkoutLog } from "@/domain/types";
import type { DashboardTrendHighlights, DashboardWeekSummary } from "@/features/dashboard/trends";

interface MotivationalQuote {
  text: string;
  author: string;
}

interface DashboardViewProps {
  adherencePercent: number;
  status: "green" | "yellow" | "red";
  trendPoints: WeeklyTrendPoint[];
  recentWorkouts: WorkoutLog[];
  nextActions: string[];
  weekSummary: DashboardWeekSummary;
  latestCheckIn?: {
    weekStartDate: string;
    weightKg: number;
    notes?: string;
    adjustment?: string;
  };
  trendHighlights: DashboardTrendHighlights;
  motivationalQuote: MotivationalQuote;
}

function Sparkline({ values, formatLabel }: { values: number[]; formatLabel?: (value: number) => string }) {
  if (values.length === 0) {
    return <small className="muted">Ingen data enda.</small>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 260;
  const chartHeight = 60;
  const height = formatLabel ? 80 : 60;

  const pointCoords = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = max === min ? chartHeight / 2 : chartHeight - ((value - min) / (max - min)) * (chartHeight - 10) - 5;
    return { x, y, value };
  });

  const points = pointCoords.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trendgraf">
      <polyline fill="none" stroke="#24595a" strokeWidth="2.5" points={points} />
      {pointCoords.map(({ x, y }, index) => (
        <circle key={index} cx={x} cy={y} r={3} fill="#24595a" />
      ))}
      {formatLabel &&
        pointCoords.map(({ x, value }, index) => (
          <text key={index} x={x} y={75} textAnchor="middle" fontSize="10" fill="#6d6458">
            {formatLabel(value)}
          </text>
        ))}
    </svg>
  );
}

function formatStatus(status: "green" | "yellow" | "red") {
  if (status === "green") {
    return "grønn";
  }
  if (status === "yellow") {
    return "gul";
  }
  return "rød";
}

function formatSignedValue(value: number, fractionDigits: number) {
  const abs = Math.abs(value);
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${formatLocalNumber(abs, fractionDigits)}`;
}

function formatTrendValue(kind: keyof DashboardTrendHighlights, value: number | undefined) {
  if (typeof value !== "number") {
    return "Ingen data enda.";
  }

  if (kind === "weight") {
    return `${formatLocalNumber(value, 1)} kg`;
  }
  if (kind === "energy") {
    return `${formatLocalNumber(value, 1)} i snitt`;
  }
  return `${value} netter`;
}

function formatTrendChange(kind: keyof DashboardTrendHighlights, delta: number | undefined) {
  if (typeof delta !== "number") {
    return "Ingen sammenlignbar uke enda.";
  }

  if (kind === "weight") {
    return `${formatSignedValue(delta, 1)} kg siden forrige veiing`;
  }
  if (kind === "energy") {
    return `${formatSignedValue(delta, 1)} siden forrige sammenlignbare uke`;
  }
  return `${formatSignedValue(delta, 0)} netter siden forrige sammenlignbare uke`;
}

function formatWeekStart(isoDate: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short"
  }).format(new Date(`${isoDate}T12:00:00.000Z`));
}

export function DashboardView({
  adherencePercent,
  status,
  trendPoints,
  recentWorkouts,
  nextActions,
  weekSummary,
  latestCheckIn,
  trendHighlights,
  motivationalQuote
}: DashboardViewProps) {
  const weightSeries = trendPoints.map((item) => item.weightKg).filter((item): item is number => typeof item === "number");
  const energySeries = trendPoints
    .map((item) => item.energyAverage)
    .filter((item): item is number => typeof item === "number");
  const sleepSeries = trendPoints.map((item) => item.sleepOkCount);

  return (
    <div className="grid">
      <section className="card appear dashboard-quote-card" aria-label="Dagens motivasjon">
        <p className="dashboard-quote-eyebrow">Dagens motivasjon</p>
        <blockquote className="dashboard-quote">
          &ldquo;{motivationalQuote.text}&rdquo;
        </blockquote>
        <p className="dashboard-quote-author">- {motivationalQuote.author}</p>
      </section>

      <section className="card appear">
        <h1>Denne uken</h1>
        <p>
          <strong>{adherencePercent}% etterlevelse</strong> <span className={`pill ${status}`}>{formatStatus(status)}</span>
        </p>
        <dl className="dashboard-summary-grid">
          <div className="dashboard-summary-item">
            <dt>Energi</dt>
            <dd>{weekSummary.energyDays} av 7 dager</dd>
            <small className="muted">
              {weekSummary.missingEnergyDays === 0
                ? "Komplett denne uken."
                : `${weekSummary.missingEnergyDays} ${weekSummary.missingEnergyDays === 1 ? "dag mangler" : "dager mangler"}.`}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>Søvn</dt>
            <dd>{weekSummary.sleepDays} av 7 dager</dd>
            <small className="muted">
              {weekSummary.missingSleepDays === 0
                ? "Komplett denne uken."
                : `${weekSummary.missingSleepDays} ${weekSummary.missingSleepDays === 1 ? "dag mangler" : "dager mangler"}.`}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>Styrkeøkter</dt>
            <dd>{weekSummary.strengthWorkouts} av {WEEKLY_STRENGTH_GOAL}</dd>
            <small className="muted">
              {weekSummary.remainingStrengthWorkouts === 0
                ? "Ukens styrkemål er nådd."
                : `${weekSummary.remainingStrengthWorkouts} ${
                    weekSummary.remainingStrengthWorkouts === 1 ? "styrkeøkt gjenstår" : "styrkeøkter gjenstår"
                  }.`}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>Gåturer</dt>
            <dd>{weekSummary.walks} av {WEEKLY_WALK_GOAL}</dd>
            <small className="muted">
              {weekSummary.remainingWalks === 0
                ? "Ukens gåturer er registrert."
                : `${weekSummary.remainingWalks} ${weekSummary.remainingWalks === 1 ? "gåtur gjenstår" : "gåturer gjenstår"}.`}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>Ukentlig check-in</dt>
            <dd>{weekSummary.weightLogged ? "Registrert" : "Mangler"}</dd>
            <small className="muted">
              {weekSummary.weightLogged ? "Veiing er lagret for denne uken." : "Legg inn vekt og refleksjon for å fullføre uken."}
            </small>
          </div>
        </dl>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h2>Vekttrend</h2>
          <p className="dashboard-metric-value">{formatTrendValue("weight", trendHighlights.weight.currentValue)}</p>
          <small className="muted">{formatTrendChange("weight", trendHighlights.weight.delta)}</small>
          <Sparkline values={weightSeries} formatLabel={(v) => formatLocalNumber(v, 1)} />
        </article>
        <article className="card">
          <h2>Energisnitt</h2>
          <p className="dashboard-metric-value">{formatTrendValue("energy", trendHighlights.energy.currentValue)}</p>
          <small className="muted">{formatTrendChange("energy", trendHighlights.energy.delta)}</small>
          <Sparkline values={energySeries} formatLabel={(v) => formatLocalNumber(v, 1)} />
        </article>
        <article className="card">
          <h2>Netter med godkjent søvn</h2>
          <p className="dashboard-metric-value">{formatTrendValue("sleep", trendHighlights.sleep.currentValue)}</p>
          <small className="muted">{formatTrendChange("sleep", trendHighlights.sleep.delta)}</small>
          <Sparkline values={sleepSeries} formatLabel={(v) => String(v)} />
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>Nylige økter</h2>
          {recentWorkouts.length === 0 ? (
            <small className="muted">Ingen økter loggført enda.</small>
          ) : (
            <ul>
              {recentWorkouts.map((item) => (
                <li key={`${item.dateTime}-${item.type}`}>
                  {item.date} - {formatWorkoutType(item.type)}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2>Siste ukentlige refleksjon</h2>
          {latestCheckIn ? (
            <div className="grid dashboard-checkin-details">
              <p>
                <strong>{formatLocalNumber(latestCheckIn.weightKg, 1)} kg</strong> registrert for uken fra{" "}
                {formatWeekStart(latestCheckIn.weekStartDate)}.
              </p>
              <p>
                <strong>Justering:</strong> {latestCheckIn.adjustment?.trim() ? latestCheckIn.adjustment : "Ingen justering lagret."}
              </p>
              <p>
                <strong>Notat:</strong> {latestCheckIn.notes?.trim() ? latestCheckIn.notes : "Ingen refleksjon lagret."}
              </p>
            </div>
          ) : (
            <small className="muted">Ingen ukentlig check-in registrert enda.</small>
          )}
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>Neste tiltak</h2>
          {nextActions.length === 0 ? (
            <small className="muted">Bra jobba. Du er i rute denne uken.</small>
          ) : (
            <ul className="dashboard-action-list">
              {nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
