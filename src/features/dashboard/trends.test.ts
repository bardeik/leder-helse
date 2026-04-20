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
    expect(snapshot.nextActions.some((item) => item.includes("Styrke A"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("søvn"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("veiing"))).toBe(true);
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
      [{ dateTime: "2026-04-14T06:00:00.000Z", date: "2026-04-14", type: "strengthA" }],
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
