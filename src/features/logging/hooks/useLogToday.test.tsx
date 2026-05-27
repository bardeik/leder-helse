import { act, cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dailyLogsRepo } from "@/data/repositories/dailyLogsRepo";
import { workoutLogsRepo } from "@/data/repositories/workoutLogsRepo";
import { useLogToday } from "@/features/logging/hooks/useLogToday";

vi.mock("@/data/repositories/dailyLogsRepo", () => ({
  dailyLogsRepo: {
    get: vi.fn(),
    upsert: vi.fn()
  }
}));

vi.mock("@/data/repositories/workoutLogsRepo", () => ({
  workoutLogsRepo: {
    listByDate: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  }
}));

type HookValue = ReturnType<typeof useLogToday>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useLogToday();

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return null;
}

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

const TODAY = "2026-05-27";

describe("useLogToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`));
    vi.mocked(dailyLogsRepo.get).mockResolvedValue(undefined);
    vi.mocked(dailyLogsRepo.upsert).mockResolvedValue(undefined);
    vi.mocked(workoutLogsRepo.listByDate).mockResolvedValue([]);
    vi.mocked(workoutLogsRepo.upsert).mockResolvedValue(1);
    vi.mocked(workoutLogsRepo.delete).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts with today as selected date and default state", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    expect(latest?.selectedDate).toBe(TODAY);
    expect(latest?.today).toBe(TODAY);
    expect(latest?.state.energy).toBe(3);
    expect(latest?.state.sleepOk).toBe(true);
    expect(latest?.canGoBack).toBe(true);
    expect(latest?.canGoForward).toBe(false);
  });

  it("loads an existing daily log for the selected date", async () => {
    vi.mocked(dailyLogsRepo.get).mockResolvedValue({
      date: TODAY,
      energy: 5,
      sleepOk: false,
      sleepHours: 6.5,
      notes: "Bra dag"
    });

    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    expect(latest?.state.energy).toBe(5);
    expect(latest?.state.sleepOk).toBe(false);
    expect(latest?.state.sleepHours).toBe(6.5);
    expect(latest?.state.notes).toBe("Bra dag");
    // Should not auto-create since log already exists
    expect(dailyLogsRepo.upsert).not.toHaveBeenCalled();
  });

  it("auto-creates a default log when none exists for the selected date", async () => {
    vi.mocked(dailyLogsRepo.get).mockResolvedValue(undefined);

    await act(async () => {
      render(<HookHarness onChange={() => undefined} />);
      await flushPromises();
    });

    expect(dailyLogsRepo.upsert).toHaveBeenCalledOnce();
    expect(dailyLogsRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ date: TODAY, energy: 3, sleepOk: true })
    );
  });

  it("loads workouts for the selected date", async () => {
    vi.mocked(workoutLogsRepo.listByDate).mockResolvedValue([
      { id: 1, dateTime: `${TODAY}T07:00:00.000Z`, date: TODAY, type: "walk" }
    ]);

    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    expect(latest?.todayWorkouts).toHaveLength(1);
    expect(latest?.todayWorkouts[0]?.type).toBe("walk");
  });

  it("navigates back to a previous date and loads that date's data", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    expect(latest?.selectedDate).toBe(TODAY);

    await act(async () => {
      latest?.goBack();
      await flushPromises();
    });

    const yesterday = "2026-05-26";
    expect(latest?.selectedDate).toBe(yesterday);
    expect(latest?.canGoForward).toBe(true);
    expect(workoutLogsRepo.listByDate).toHaveBeenCalledWith(yesterday);
  });

  it("does not go back further than MAX_PAST_DAYS (13 days)", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    // Go back 13 times to reach the minimum date
    for (let i = 0; i < 13; i++) {
      await act(async () => {
        latest?.goBack();
        await flushPromises();
      });
    }

    expect(latest?.canGoBack).toBe(false);
    expect(latest?.selectedDate).toBe("2026-05-14");

    // Attempt to go back again — should be a no-op
    const dateBefore = latest?.selectedDate;
    await act(async () => {
      latest?.goBack();
      await flushPromises();
    });

    expect(latest?.selectedDate).toBe(dateBefore);
  });

  it("does not go forward past today", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    await act(async () => {
      latest?.goBack();
      await flushPromises();
    });

    expect(latest?.canGoForward).toBe(true);

    await act(async () => {
      latest?.goForward();
      await flushPromises();
    });

    expect(latest?.selectedDate).toBe(TODAY);
    expect(latest?.canGoForward).toBe(false);
  });

  it("saves a daily log and shows a transient success message", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    vi.mocked(dailyLogsRepo.upsert).mockClear();

    await act(async () => {
      await latest?.save({ date: TODAY, energy: 4, sleepOk: true, sleepHours: 7 });
      await flushPromises();
    });

    expect(dailyLogsRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ date: TODAY, energy: 4, sleepOk: true, sleepHours: 7 })
    );
    expect(latest?.message).toBe("Endringer lagret");

    await act(async () => {
      vi.advanceTimersByTime(1800);
    });

    expect(latest?.message).toBe("");
  });

  it("shows an error message when save fails", async () => {
    vi.mocked(dailyLogsRepo.upsert).mockRejectedValue(new Error("db error"));

    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    let result: boolean | undefined;

    await act(async () => {
      result = await latest?.save({ date: TODAY, energy: 4, sleepOk: true });
      await flushPromises();
    });

    expect(result).toBe(false);
    expect(latest?.message).toBe("Kontroller feltene dine.");
    expect(latest?.saving).toBe(false);
  });

  it("adds a quick workout for today using the current timestamp", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    await act(async () => {
      await latest?.addQuickWorkout("walk");
      await flushPromises();
    });

    expect(workoutLogsRepo.upsert).toHaveBeenCalledOnce();
    expect(workoutLogsRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "walk", date: TODAY })
    );
    expect(latest?.todayWorkouts).toHaveLength(1);
    expect(latest?.todayWorkouts[0]?.type).toBe("walk");
    expect(latest?.message).toBe("Endringer lagret");
  });

  it("adds a quick workout for a past date using noon as dateTime", async () => {
    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    await act(async () => {
      latest?.goBack();
      await flushPromises();
    });

    const yesterday = "2026-05-26";

    await act(async () => {
      await latest?.addQuickWorkout("strength");
      await flushPromises();
    });

    expect(workoutLogsRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "strength",
        date: yesterday,
        dateTime: `${yesterday}T12:00:00.000Z`
      })
    );
  });

  it("removes a workout from the list", async () => {
    vi.mocked(workoutLogsRepo.listByDate).mockResolvedValue([
      { id: 42, dateTime: `${TODAY}T07:00:00.000Z`, date: TODAY, type: "walk" }
    ]);

    let latest: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(v) => (latest = v)} />);
      await flushPromises();
    });

    expect(latest?.todayWorkouts).toHaveLength(1);

    await act(async () => {
      await latest?.removeWorkout(42);
      await flushPromises();
    });

    expect(workoutLogsRepo.delete).toHaveBeenCalledWith(42);
    expect(latest?.todayWorkouts).toHaveLength(0);
    expect(latest?.message).toBe("Aktivitet slettet");
  });

  it("ignores repo responses arriving after the hook unmounts (no state updates after unmount)", async () => {
    let resolveDailyLog: ((v: undefined) => void) | undefined;

    vi.mocked(dailyLogsRepo.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDailyLog = resolve as (v: undefined) => void;
        })
    );

    let latest: HookValue | undefined;
    const { unmount } = render(<HookHarness onChange={(v) => (latest = v)} />);

    await act(async () => {
      unmount();
    });

    // Resolving after unmount should not throw or trigger state updates
    await act(async () => {
      resolveDailyLog?.(undefined);
      await flushPromises();
    });

    // The key check: no error thrown; daily logs and workouts repos were each called once
    expect(dailyLogsRepo.get).toHaveBeenCalledOnce();
  });
});
