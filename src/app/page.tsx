"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyLogsRepo } from "@/data/repositories/dailyLogsRepo";
import { weeklyCheckInsRepo } from "@/data/repositories/weeklyCheckInsRepo";
import { workoutLogsRepo } from "@/data/repositories/workoutLogsRepo";
import { buildWeeklyTrends, getRecentWeekStarts, getWeekStartDate } from "@/domain/calc";
import type { DailyLog, WeeklyCheckIn, WorkoutLog } from "@/domain/types";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { getRandomMotivationalQuote } from "@/features/dashboard/motivationalQuotes";
import { getDashboardSnapshot } from "@/features/dashboard/trends";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function HomePage() {
  const { locale, translations: t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const motivationalQuote = useMemo(() => getRandomMotivationalQuote(locale), [locale]);

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 10);
    const weekStarts = getRecentWeekStarts(now, 6);
    const start = weekStarts[0] ?? now;
    const end = `${now}T23:59:59.000Z`.slice(0, 10);

    Promise.all([
      dailyLogsRepo.listByRange(start, end),
      weeklyCheckInsRepo.listByRange(start, weekStarts[weekStarts.length - 1] ?? now),
      workoutLogsRepo.listByRange(start, end)
    ])
      .then(([daily, checkIns, workoutList]) => {
        setDailyLogs(daily);
        setWeeklyCheckIns(checkIns);
        setWorkouts(workoutList);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="card">
        <h1>{t.nav.pages.home}</h1>
        <small className="muted">{t.dashboard.loadingData}</small>
      </section>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekStarts = getRecentWeekStarts(today, 6);
  const currentWeek = getWeekStartDate(today);

  const trends = buildWeeklyTrends(weekStarts, dailyLogs, weeklyCheckIns);
  const snapshot = getDashboardSnapshot(currentWeek, dailyLogs, weeklyCheckIns, workouts, trends, today, t.dashboard);

  return (
    <DashboardView
      adherencePercent={snapshot.adherencePercent}
      status={snapshot.status}
      trendPoints={trends}
      recentWorkouts={snapshot.recentWorkouts}
      nextActions={snapshot.nextActions}
      weekSummary={snapshot.weekSummary}
      latestCheckIn={snapshot.latestCheckIn}
      trendHighlights={snapshot.trendHighlights}
      motivationalQuote={motivationalQuote}
    />
  );
}
