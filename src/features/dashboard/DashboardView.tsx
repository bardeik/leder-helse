"use client";

import type { WeeklyTrendPoint, WorkoutLog } from "@/domain/types";

interface DashboardViewProps {
  adherencePercent: number;
  status: "green" | "yellow" | "red";
  trendPoints: WeeklyTrendPoint[];
  recentWorkouts: WorkoutLog[];
  nextActions: string[];
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) {
    return <small className="muted">No data yet.</small>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 260;
  const height = 60;

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = max === min ? height / 2 : height - ((value - min) / (max - min)) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart">
      <polyline fill="none" stroke="#24595a" strokeWidth="2.5" points={points} />
    </svg>
  );
}

export function DashboardView({ adherencePercent, status, trendPoints, recentWorkouts, nextActions }: DashboardViewProps) {
  const weightSeries = trendPoints.map((item) => item.weightKg).filter((item): item is number => typeof item === "number");
  const energySeries = trendPoints
    .map((item) => item.energyAverage)
    .filter((item): item is number => typeof item === "number");
  const sleepSeries = trendPoints.map((item) => item.sleepOkCount);

  return (
    <div className="grid">
      <section className="card appear">
        <h1>This week</h1>
        <p>
          <strong>{adherencePercent}% adherence</strong> <span className={`pill ${status}`}>{status}</span>
        </p>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h2>Weight trend</h2>
          <Sparkline values={weightSeries} />
        </article>
        <article className="card">
          <h2>Energy average</h2>
          <Sparkline values={energySeries} />
        </article>
        <article className="card">
          <h2>Sleep-ok nights</h2>
          <Sparkline values={sleepSeries} />
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>Recent workouts</h2>
          {recentWorkouts.length === 0 ? (
            <small className="muted">No workouts logged yet.</small>
          ) : (
            <ul>
              {recentWorkouts.map((item) => (
                <li key={`${item.dateTime}-${item.type}`}>
                  {item.date} - {item.type}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2>Next actions</h2>
          {nextActions.length === 0 ? (
            <small className="muted">Great job. You are on track this week.</small>
          ) : (
            <ul>
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
