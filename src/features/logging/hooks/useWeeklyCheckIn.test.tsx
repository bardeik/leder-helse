import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { addDays, getWeekStartDate } from "@/domain/calc";
import { useWeeklyCheckIn } from "@/features/logging/hooks/useWeeklyCheckIn";
import { weeklyCheckInsRepo } from "@/data/repositories/weeklyCheckInsRepo";

vi.mock("@/data/repositories/weeklyCheckInsRepo", () => ({
  weeklyCheckInsRepo: {
    get: vi.fn(),
    upsert: vi.fn()
  }
}));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

type HookValue = ReturnType<typeof useWeeklyCheckIn>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useWeeklyCheckIn();

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return null;
}

describe("useWeeklyCheckIn", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T12:00:00.000Z"));
    vi.mocked(weeklyCheckInsRepo.get).mockReset();
    vi.mocked(weeklyCheckInsRepo.upsert).mockReset();

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it("prefills weight from the previous week when the selected week has no saved weigh-in", async () => {
    const currentWeekStart = getWeekStartDate("2026-05-05");
    const previousWeekStart = addDays(currentWeekStart, -7);
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockImplementation(async (weekStartDate: string) => {
      if (weekStartDate === currentWeekStart) {
        return undefined;
      }

      if (weekStartDate === previousWeekStart) {
        return { weekStartDate, weightKg: 81.4 };
      }

      return undefined;
    });

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(weeklyCheckInsRepo.get).toHaveBeenNthCalledWith(1, currentWeekStart);
    expect(weeklyCheckInsRepo.get).toHaveBeenNthCalledWith(2, previousWeekStart);
    expect(latestValue?.state.weightKg).toBe(81.4);
  });

  it("keeps the saved weight for the selected week when one already exists", async () => {
    const currentWeekStart = getWeekStartDate("2026-05-05");
    const previousWeekStart = addDays(currentWeekStart, -7);
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockImplementation(async (weekStartDate: string) => {
      if (weekStartDate === currentWeekStart) {
        return { weekStartDate, weightKg: 79.8 };
      }

      if (weekStartDate === previousWeekStart) {
        return { weekStartDate, weightKg: 81.4 };
      }

      return undefined;
    });

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(latestValue?.state.weightKg).toBe(79.8);
  });

  it("falls back to the default weight when neither week has a saved weigh-in", async () => {
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockResolvedValue(undefined);

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(latestValue?.state.weightKg).toBe(80);
  });

  it("navigates between the three allowed weeks", async () => {
    const currentWeekStart = getWeekStartDate("2026-05-05");
    const previousWeekStart = addDays(currentWeekStart, -7);
    const oldestWeekStart = addDays(currentWeekStart, -14);
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockResolvedValue(undefined);

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(latestValue?.selectedWeekStart).toBe(currentWeekStart);
    expect(latestValue?.canGoBack).toBe(true);
    expect(latestValue?.canGoForward).toBe(false);

    await act(async () => {
      latestValue?.goBack();
      await flushPromises();
    });

    expect(latestValue?.selectedWeekStart).toBe(previousWeekStart);
    expect(latestValue?.canGoBack).toBe(true);
    expect(latestValue?.canGoForward).toBe(true);

    await act(async () => {
      latestValue?.goBack();
      await flushPromises();
    });

    expect(latestValue?.selectedWeekStart).toBe(oldestWeekStart);
    expect(latestValue?.canGoBack).toBe(false);
    expect(latestValue?.canGoForward).toBe(true);

    await act(async () => {
      latestValue?.goForward();
      await flushPromises();
    });

    expect(latestValue?.selectedWeekStart).toBe(previousWeekStart);
  });

  it("saves trimmed values and clears the transient message after the timeout", async () => {
    const currentWeekStart = getWeekStartDate("2026-05-05");
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockResolvedValue(undefined);
    vi.mocked(weeklyCheckInsRepo.upsert).mockResolvedValue(undefined);

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    const nextState = {
      weekStartDate: currentWeekStart,
      weightKg: 77.2,
      notes: "  Holdt planen  ",
      adjustment: "  Gå en ekstra tur  "
    };

    await act(async () => {
      await latestValue?.save(nextState);
      await flushPromises();
    });

    expect(weeklyCheckInsRepo.upsert).toHaveBeenCalledWith({
      weekStartDate: currentWeekStart,
      weightKg: 77.2,
      notes: "Holdt planen",
      adjustment: "Gå en ekstra tur"
    });
    expect(latestValue?.saving).toBe(false);
    expect(latestValue?.message).toBe("Endringer lagret");

    await act(async () => {
      vi.advanceTimersByTime(1800);
    });

    expect(latestValue?.message).toBe("");
  });

  it("shows a validation message when save fails", async () => {
    let latestValue: HookValue | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockResolvedValue(undefined);
    vi.mocked(weeklyCheckInsRepo.upsert).mockRejectedValue(new Error("invalid weight"));

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    let saveResult: boolean | undefined;

    await act(async () => {
      saveResult = await latestValue?.save({
        ...latestValue!.state,
        weightKg: 0
      });
      await flushPromises();
    });

    expect(saveResult).toBe(false);
    expect(latestValue?.saving).toBe(false);
    expect(latestValue?.message).toBe("Skriv inn en gyldig vekt.");
  });

  it("ignores late repo responses after the hook unmounts", async () => {
    let resolveCurrentWeek: ((value: undefined) => void) | undefined;

    vi.mocked(weeklyCheckInsRepo.get).mockImplementation(
      (async () =>
        new Promise((resolve) => {
          resolveCurrentWeek = resolve as (value: undefined) => void;
        })) as typeof weeklyCheckInsRepo.get
    );

    await act(async () => {
      root.render(<HookHarness onChange={() => undefined} />);
    });

    await act(async () => {
      root.unmount();
    });

    await act(async () => {
      resolveCurrentWeek?.(undefined);
      await flushPromises();
    });

    expect(weeklyCheckInsRepo.get).toHaveBeenCalledTimes(2);
  });
});
