import { describe, expect, it } from "vitest";
import { getTranslation } from "@/i18n/locales";

function describeShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => describeShape(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, describeShape(item)])
    );
  }

  return typeof value;
}

function exerciseDictionary(locale: "no" | "en") {
  const t = getTranslation(locale);

  t.dashboard.adherenceFormat(81);
  t.dashboard.daysOf7Format(4);
  t.dashboard.ofGoalFormat(2, 3);
  t.dashboard.daysMissing(1);
  t.dashboard.daysMissing(2);
  t.dashboard.strengthWorkoutsRemaining(1);
  t.dashboard.strengthWorkoutsRemaining(3);
  t.dashboard.walksRemaining(1);
  t.dashboard.walksRemaining(3);
  t.dashboard.trendValueWeight("84.5");
  t.dashboard.trendValueEnergy("4.3");
  t.dashboard.trendValueSleep(5);
  t.dashboard.trendChangeWeight("+0.4");
  t.dashboard.trendChangeEnergy("-0.3");
  t.dashboard.trendChangeSleep("+1");
  t.dashboard.weightRegisteredForWeek("84.5", "14 Apr");
  t.dashboard.nextActionLogEnergy(2);
  t.dashboard.nextActionLogSleep(2);
  t.dashboard.nextActionAddStrength(2);
  t.dashboard.nextActionAddWalk(2);

  t.log.titleDate("2026-05-01");
  t.log.activitiesDate("2026-05-01");

  t.checkIn.weekStarting("2026-05-01");

  t.workout.roundExercise(2, 3);
  t.workout.progressText(1, 27, 4);
  t.workout.watchVideoAria("Squat");
  t.workout.summaryStats(3, 27);

  t.settings.storageSummary(1, 2, 3);
  t.settings.notificationPermission("default");
}

describe("locales", () => {
  it("provides localized strings for Norwegian and English", () => {
    exerciseDictionary("no");
    exerciseDictionary("en");

    expect(getTranslation("no").nav.pages.home).toBe("Oversikt");
    expect(getTranslation("en").nav.pages.home).toBe("Overview");
  });

  it("keeps the Norwegian and English translation trees in sync", () => {
    expect(describeShape(getTranslation("no"))).toEqual(describeShape(getTranslation("en")));
  });
});
