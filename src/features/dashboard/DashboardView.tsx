"use client";

import { WEEKLY_STRENGTH_GOAL, WEEKLY_WALK_GOAL } from "@/domain/calc";
import { formatLocalNumber } from "@/domain/localeNumber";
import { formatWorkoutType } from "@/domain/workouts";
import type { WeeklyTrendPoint, WorkoutLog } from "@/domain/types";
import type { DashboardTrendHighlights, DashboardWeekSummary } from "@/features/dashboard/trends";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { TranslationDict } from "@/i18n/types";

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

function Sparkline({
  values,
  formatLabel,
  emptyLabel,
  ariaLabel
}: {
  values: number[];
  formatLabel?: (value: number) => string;
  emptyLabel: string;
  ariaLabel: string;
}) {
  if (values.length === 0) {
    return <small className="muted">{emptyLabel}</small>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const chartWidth = 260;
  const horizontalPadding = 14;
  const width = chartWidth + horizontalPadding * 2;
  const chartHeight = 60;
  const height = formatLabel ? 80 : 60;

  const pointCoords = values.map((value, index) => {
    const x = horizontalPadding + (index / Math.max(values.length - 1, 1)) * chartWidth;
    const y = max === min ? chartHeight / 2 : chartHeight - ((value - min) / (max - min)) * (chartHeight - 10) - 5;
    return { x, y, value };
  });

  const points = pointCoords.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      <polyline fill="none" stroke="#24595a" strokeWidth="2.5" points={points} />
      {pointCoords.map(({ x, y }, index) => (
        <circle key={index} cx={x} cy={y} r={3} fill="#24595a" />
      ))}
      {formatLabel &&
        pointCoords.map(({ x, value }, index) => (
          <text
            key={index}
            x={x}
            y={75}
            textAnchor={index === 0 ? "start" : index === pointCoords.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="#6d6458"
          >
            {formatLabel(value)}
          </text>
        ))}
    </svg>
  );
}

function formatStatus(status: "green" | "yellow" | "red", t: TranslationDict) {
  return t.dashboard.statusLabel[status];
}

function formatSignedValue(value: number, fractionDigits: number) {
  const abs = Math.abs(value);
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${formatLocalNumber(abs, fractionDigits)}`;
}

function formatTrendValue(kind: keyof DashboardTrendHighlights, value: number | undefined, t: TranslationDict) {
  if (typeof value !== "number") {
    return t.dashboard.noDataYet;
  }

  if (kind === "weight") {
    return t.dashboard.trendValueWeight(formatLocalNumber(value, 1));
  }
  if (kind === "energy") {
    return t.dashboard.trendValueEnergy(formatLocalNumber(value, 1));
  }
  return t.dashboard.trendValueSleep(value);
}

function formatTrendChange(kind: keyof DashboardTrendHighlights, delta: number | undefined, t: TranslationDict) {
  if (typeof delta !== "number") {
    return t.dashboard.noComparableWeek;
  }

  if (kind === "weight") {
    return t.dashboard.trendChangeWeight(formatSignedValue(delta, 1));
  }
  if (kind === "energy") {
    return t.dashboard.trendChangeEnergy(formatSignedValue(delta, 1));
  }
  return t.dashboard.trendChangeSleep(formatSignedValue(delta, 0));
}

function formatWeekStart(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
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
  const { locale, translations: t } = useTranslation();
  const weightSeries = trendPoints
    .map((item) => item.weightKg)
    .filter((item): item is number => typeof item === "number");
  const energySeries = trendPoints
    .map((item) => item.energyAverage)
    .filter((item): item is number => typeof item === "number");
  const sleepSeries = trendPoints.map((item) => item.sleepOkCount);

  return (
    <div className="grid">
      <section className="card appear dashboard-quote-card" aria-label={t.dashboard.motivationSection}>
        <p className="dashboard-quote-eyebrow">{t.dashboard.motivationSection}</p>
        <blockquote className="dashboard-quote">&ldquo;{motivationalQuote.text}&rdquo;</blockquote>
        <p className="dashboard-quote-author">- {motivationalQuote.author}</p>
      </section>

      <section className="card appear">
        <h1>{t.dashboard.thisWeek}</h1>
        <p>
          <strong>{t.dashboard.adherenceFormat(adherencePercent)}</strong>{" "}
          <span className={`pill ${status}`}>{formatStatus(status, t)}</span>
        </p>
        <dl className="dashboard-summary-grid">
          <div className="dashboard-summary-item">
            <dt>{t.dashboard.energyLabel}</dt>
            <dd>{t.dashboard.daysOf7Format(weekSummary.energyDays)}</dd>
            <small className="muted">
              {weekSummary.missingEnergyDays === 0
                ? t.dashboard.completeThisWeek
                : t.dashboard.daysMissing(weekSummary.missingEnergyDays)}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>{t.dashboard.sleepLabel}</dt>
            <dd>{t.dashboard.daysOf7Format(weekSummary.sleepDays)}</dd>
            <small className="muted">
              {weekSummary.missingSleepDays === 0
                ? t.dashboard.completeThisWeek
                : t.dashboard.daysMissing(weekSummary.missingSleepDays)}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>{t.dashboard.strengthWorkoutsLabel}</dt>
            <dd>{t.dashboard.ofGoalFormat(weekSummary.strengthWorkouts, WEEKLY_STRENGTH_GOAL)}</dd>
            <small className="muted">
              {weekSummary.remainingStrengthWorkouts === 0
                ? t.dashboard.strengthGoalReached
                : t.dashboard.strengthWorkoutsRemaining(weekSummary.remainingStrengthWorkouts)}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>{t.dashboard.walksLabel}</dt>
            <dd>{t.dashboard.ofGoalFormat(weekSummary.walks, WEEKLY_WALK_GOAL)}</dd>
            <small className="muted">
              {weekSummary.remainingWalks === 0
                ? t.dashboard.walksGoalReached
                : t.dashboard.walksRemaining(weekSummary.remainingWalks)}
            </small>
          </div>
          <div className="dashboard-summary-item">
            <dt>{t.dashboard.weeklyCheckInLabel}</dt>
            <dd>{weekSummary.weightLogged ? t.dashboard.registered : t.dashboard.missing}</dd>
            <small className="muted">
              {weekSummary.weightLogged ? t.dashboard.weightLoggedThisWeek : t.dashboard.weightNotLogged}
            </small>
          </div>
        </dl>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h2>{t.dashboard.weightTrend}</h2>
          <p className="dashboard-metric-value">{formatTrendValue("weight", trendHighlights.weight.currentValue, t)}</p>
          <small className="muted">{formatTrendChange("weight", trendHighlights.weight.delta, t)}</small>
          <Sparkline
            values={weightSeries}
            formatLabel={(v) => formatLocalNumber(v, 1)}
            emptyLabel={t.dashboard.noDataYet}
            ariaLabel={t.dashboard.trendGraphAriaLabel}
          />
        </article>
        <article className="card">
          <h2>{t.dashboard.energyAverage}</h2>
          <p className="dashboard-metric-value">{formatTrendValue("energy", trendHighlights.energy.currentValue, t)}</p>
          <small className="muted">{formatTrendChange("energy", trendHighlights.energy.delta, t)}</small>
          <Sparkline
            values={energySeries}
            formatLabel={(v) => formatLocalNumber(v, 1)}
            emptyLabel={t.dashboard.noDataYet}
            ariaLabel={t.dashboard.trendGraphAriaLabel}
          />
        </article>
        <article className="card">
          <h2>{t.dashboard.sleepNights}</h2>
          <p className="dashboard-metric-value">{formatTrendValue("sleep", trendHighlights.sleep.currentValue, t)}</p>
          <small className="muted">{formatTrendChange("sleep", trendHighlights.sleep.delta, t)}</small>
          <Sparkline
            values={sleepSeries}
            formatLabel={(v) => String(v)}
            emptyLabel={t.dashboard.noDataYet}
            ariaLabel={t.dashboard.trendGraphAriaLabel}
          />
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>{t.dashboard.recentWorkouts}</h2>
          {recentWorkouts.length === 0 ? (
            <small className="muted">{t.dashboard.noWorkoutsYet}</small>
          ) : (
            <ul>
              {recentWorkouts.map((item) => (
                <li key={`${item.dateTime}-${item.type}`}>
                  {item.date} - {formatWorkoutType(item.type, locale)}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2>{t.dashboard.latestReflection}</h2>
          {latestCheckIn ? (
            <div className="grid dashboard-checkin-details">
              <p>
                {t.dashboard.weightRegisteredForWeek(
                  formatLocalNumber(latestCheckIn.weightKg, 1),
                  formatWeekStart(latestCheckIn.weekStartDate, t.intlLocale)
                )}
              </p>
              <p>
                <strong>{t.dashboard.adjustmentLabel}</strong>{" "}
                {latestCheckIn.adjustment?.trim() ? latestCheckIn.adjustment : t.dashboard.noAdjustmentSaved}
              </p>
              <p>
                <strong>{t.dashboard.notesLabel}</strong>{" "}
                {latestCheckIn.notes?.trim() ? latestCheckIn.notes : t.dashboard.noReflectionSaved}
              </p>
            </div>
          ) : (
            <small className="muted">{t.dashboard.noCheckInYet}</small>
          )}
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>{t.dashboard.nextActions}</h2>
          {nextActions.length === 0 ? (
            <small className="muted">{t.dashboard.onTrack}</small>
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
