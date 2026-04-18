import { describe, expect, it } from "vitest";
import { getDashboardSnapshot } from "@/features/dashboard/trends";

describe("dashboard trend helpers", () => {
  it("suggests missing workouts as next actions", () => {
    const snapshot = getDashboardSnapshot(
      "2026-04-13",
      [{ date: "2026-04-13", energy: 4, sleepOk: true }],
      [],
      [{ dateTime: "2026-04-13T06:00:00.000Z", date: "2026-04-13", type: "walk" }]
    );

    expect(snapshot.nextActions.some((item) => item.includes("Styrke A"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("Styrke B"))).toBe(true);
    expect(snapshot.nextActions.some((item) => item.includes("veiing"))).toBe(true);
  });
});
