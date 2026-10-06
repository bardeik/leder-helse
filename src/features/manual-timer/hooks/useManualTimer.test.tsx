import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MANUAL_TIMER_STORAGE_KEY, useManualTimer } from "./useManualTimer";

describe("useManualTimer", () => {
  const release = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn();
  const stop = vi.fn();
  const startTone = vi.fn();
  const close = vi.fn().mockResolvedValue(undefined);
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close,
    createOscillator: vi.fn(() => ({
      frequency: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: startTone,
      stop
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    }))
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    request.mockResolvedValue({ released: false, release, addEventListener: vi.fn() });
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });
    vi.stubGlobal("AudioContext", function () {
      return context;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, "wakeLock");
  });

  async function begin(start: () => void) {
    await act(async () => start());
  }
  function advance(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  it("counts down, emits short ticks and a long beep one second before activity", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    expect(stop).toHaveBeenLastCalledWith(0.12);
    advance(1000);
    expect(startTone).toHaveBeenCalledTimes(2);
    advance(1000);
    expect(stop).toHaveBeenLastCalledWith(0.7);
    advance(1000);
    expect(result.current.timer.phase).toBe("activity");
    expect(startTone).toHaveBeenCalledTimes(3);
    unmount();
  });

  it("beeps at rest, counts rounds and releases the lock at completion", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    act(() => result.current.updateSettings({ activitySeconds: 10, restSeconds: 10, rounds: 2 }));
    await begin(result.current.start);
    expect(result.current.wakeStatus).toBe("active");
    advance(13000);
    expect(result.current.timer).toEqual({ phase: "rest", remainingMs: 10000, completedRounds: 1 });
    expect(stop).toHaveBeenLastCalledWith(0.7);
    advance(10000);
    expect(result.current.timer.phase).toBe("activity");
    advance(10000);
    expect(result.current.running).toBe(false);
    expect(result.current.timer.completedRounds).toBe(2);
    expect(result.current.timer.phase).toBe("complete");
    expect(release).toHaveBeenCalledOnce();
    unmount();
  });

  it("pauses without losing fractional time or releasing the visible session lock", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    advance(1250);
    act(() => result.current.pause());
    expect(result.current.timer.remainingMs).toBe(1750);
    advance(5000);
    expect(result.current.timer.remainingMs).toBe(1750);
    expect(release).not.toHaveBeenCalled();
    await begin(result.current.start);
    advance(1750);
    expect(result.current.timer.phase).toBe("activity");
    unmount();
  });

  it("pauses on backgrounding and reacquires the screen lock without resuming", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.running).toBe(false);
    expect(release).toHaveBeenCalledOnce();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(request).toHaveBeenCalledTimes(2);
    expect(result.current.running).toBe(false);
    unmount();
  });

  it("locks settings until reset and persists validated settings only", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    const settings = { activitySeconds: 10, restSeconds: 0, rounds: 1 };
    act(() => result.current.updateSettings(settings));
    expect(JSON.parse(localStorage.getItem(MANUAL_TIMER_STORAGE_KEY)!)).toEqual(settings);
    await begin(result.current.start);
    act(() => result.current.updateSettings({ ...settings, rounds: 2 }));
    expect(result.current.settings.rounds).toBe(1);
    act(() => result.current.reset());
    expect(result.current.started).toBe(false);
    expect(result.current.timer.remainingMs).toBe(3000);
    act(() => result.current.updateSettings({ ...settings, rounds: 0 }));
    expect(result.current.settings.rounds).toBe(1);
    unmount();
  });

  it.each(["{broken", '{"activitySeconds":-1,"restSeconds":20,"rounds":6}'])(
    "falls back for tampered storage %s",
    (stored) => {
      localStorage.setItem(MANUAL_TIMER_STORAGE_KEY, stored);
      const { result, unmount } = renderHook(useManualTimer);
      expect(result.current.settings.activitySeconds).toBe(40);
      unmount();
    }
  );

  it("loads settings but never resumes a session after remount", () => {
    localStorage.setItem(MANUAL_TIMER_STORAGE_KEY, JSON.stringify({ activitySeconds: 30, restSeconds: 0, rounds: 3 }));
    const { result, unmount } = renderHook(useManualTimer);
    expect(result.current.settings.activitySeconds).toBe(30);
    expect(result.current.started).toBe(false);
    unmount();
  });

  it("continues without wake lock or audio support and exposes warnings", async () => {
    request.mockRejectedValue(new Error("Denied"));
    vi.stubGlobal("AudioContext", undefined);
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    expect(result.current.wakeStatus).toBe("unavailable");
    expect(result.current.audioUnavailable).toBe(true);
    advance(3000);
    expect(result.current.timer.phase).toBe("activity");
    unmount();
  });

  it("mutes tones and cleans up audio and wake lock on unmount", async () => {
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    act(() => result.current.toggleMute());
    const count = startTone.mock.calls.length;
    advance(2000);
    expect(startTone).toHaveBeenCalledTimes(count);
    expect(result.current.muted).toBe(true);
    unmount();
    expect(close).toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });

  it("releases an asynchronously acquired lock if reset happened first", async () => {
    let resolveLock: (value: unknown) => void = () => undefined;
    request.mockReturnValue(
      new Promise((resolve) => {
        resolveLock = resolve;
      })
    );
    const { result, unmount } = renderHook(useManualTimer);
    await begin(result.current.start);
    act(() => result.current.reset());
    await act(async () => resolveLock({ released: false, release, addEventListener: vi.fn() }));
    expect(release).toHaveBeenCalledOnce();
    expect(result.current.wakeStatus).toBe("inactive");
    unmount();
  });
});
