import { describe, expect, it } from "vitest";
import { getDashboardSnapshot } from "@/features/dashboard/trends";

describe("dashboard trend helpers", () => {
  it("summarizes missing weekly data and actions", () => {
    const snapshot = getDashboardSnapshot(
      "2026-04-13",
      [{ date: "2026-04-13", energy: 4, sleepOk: true }],
      [],
      [{ dateTime: "2026-04-13T06:00:00.000Z", date: "2026-04-13", type: "walk" }],
      [{ weekStartDate: "2026-04-13", energyAverage: 4, sleepOkCount: 1 }]
    );

    expect(snapshot.weekSummary.energyDays).toBe(1);
    expect(snapshot.weekSummary.missingEnergyDays).toBe(6);
    expect(snapshot.weekSummary.weightLogged).toBe(false);
    expect(snapshot.weekSummary.walks).toBe(1);
    expect(snapshot.nextActions.some((item) => item.includes("styrkeøkt"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("4 gåturer"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("søvn"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("veiing"))).toBe(true);
  });

  it("prorates missing days to elapsed days for current week", () => {
    // weekStart = Monday 2026-04-13, today = Wednesday 2026-04-15 → daysElapsed = 3
    // 3 energy + 3 sleep + 2 workouts = 8 completed; total = 3+3+7 = 13 → 62%
    const snapshot = getDashboardSnapshot(
      "2026-04-13",
      [
        { date: "2026-04-13", energy: 4, sleepOk: true },
        { date: "2026-04-14", energy: 3, sleepOk: true },
        { date: "2026-04-15", energy: 5, sleepOk: true }
      ],
      [],
      [
        { dateTime: "2026-04-13T07:00:00.000Z", date: "2026-04-13", type: "walk" },
        { dateTime: "2026-04-14T07:00:00.000Z", date: "2026-04-14", type: "strength" }
      ],
      [{ weekStartDate: "2026-04-13", energyAverage: 4, sleepOkCount: 3 }],
      "2026-04-15"
    );

    expect(snapshot.weekSummary.missingEnergyDays).toBe(0);
    expect(snapshot.adherencePercent).toBeGreaterThan(50);
  });

  it("derives current highlights and latest check-in details", () => {
    const snapshot = getDashboardSnapshot(
      "2026-04-13",
      [
        { date: "2026-04-07", energy: 3, sleepOk: true },
        { date: "2026-04-13", energy: 4, sleepOk: true },
        { date: "2026-04-14", energy: 5, sleepOk: false }
      ],
      [
        { weekStartDate: "2026-04-07", weightKg: 85.1, notes: "Holdt planen" },
        { weekStartDate: "2026-04-13", weightKg: 84.7, adjustment: "Legge meg tidligere" }
      ],
      [{ dateTime: "2026-04-14T06:00:00.000Z", date: "2026-04-14", type: "strength" }],
      [
        { weekStartDate: "2026-04-07", weightKg: 85.1, energyAverage: 3.4, sleepOkCount: 4 },
        { weekStartDate: "2026-04-13", weightKg: 84.7, weightDeltaKg: -0.4, energyAverage: 4.5, sleepOkCount: 5 }
      ]
    );

    expect(snapshot.latestCheckIn?.weekStartDate).toBe("2026-04-13");
    expect(snapshot.trendHighlights.weight.currentValue).toBe(84.7);
    expect(snapshot.trendHighlights.weight.delta).toBe(-0.4);
    expect(snapshot.trendHighlights.energy.delta).toBe(1.1);
    expect(snapshot.trendHighlights.sleep.delta).toBe(1);
  });
});
