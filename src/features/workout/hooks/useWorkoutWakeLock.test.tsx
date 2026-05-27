import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkoutWakeLock } from "@/features/workout/hooks/useWorkoutWakeLock";

type HookValue = ReturnType<typeof useWorkoutWakeLock>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useWorkoutWakeLock();

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return null;
}

function setVisibilityState(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state
  });
}

describe("useWorkoutWakeLock", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latestValue: HookValue | undefined;

  const wakeLockRelease = vi.fn().mockResolvedValue(undefined);
  const wakeLockAddEventListener = vi.fn();
  const wakeLockRequest = vi.fn();

  const oscillator = {
    frequency: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  };
  const gain = {
    gain: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
  const audioContext = {
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
    destination: {}
  };

  function MockAudioContext() {
    return audioContext;
  }

  beforeEach(() => {
    setVisibilityState("visible");
    latestValue = undefined;
    wakeLockRelease.mockClear();
    wakeLockAddEventListener.mockClear();
    wakeLockRequest.mockClear();
    oscillator.connect.mockClear();
    oscillator.disconnect.mockClear();
    oscillator.start.mockClear();
    oscillator.stop.mockClear();
    gain.connect.mockClear();
    gain.disconnect.mockClear();
    audioContext.resume.mockClear();
    audioContext.close.mockClear();
    audioContext.createOscillator.mockClear();
    audioContext.createGain.mockClear();

    vi.stubGlobal("AudioContext", MockAudioContext);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    Reflect.deleteProperty(navigator, "wakeLock");
    vi.unstubAllGlobals();
  });

  it("uses Screen Wake Lock API when available", async () => {
    wakeLockRequest.mockResolvedValue({
      released: false,
      release: wakeLockRelease,
      addEventListener: wakeLockAddEventListener
    });

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: wakeLockRequest }
    });

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(wakeLockRequest).toHaveBeenCalledWith("screen");
    expect(wakeLockAddEventListener).toHaveBeenCalledWith("release", expect.any(Function));
    expect(latestValue?.mode).toBe("screen-wake-lock");
    expect(latestValue?.active).toBe(true);
    expect(audioContext.createOscillator).not.toHaveBeenCalled();
  });

  it("releases an existing wake lock before requesting a new one", async () => {
    const firstRelease = vi.fn().mockResolvedValue(undefined);

    wakeLockRequest
      .mockResolvedValueOnce({
        released: false,
        release: firstRelease,
        addEventListener: wakeLockAddEventListener
      })
      .mockResolvedValueOnce({
        released: false,
        release: wakeLockRelease,
        addEventListener: wakeLockAddEventListener
      });

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: wakeLockRequest }
    });

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
      await latestValue?.acquire();
    });

    expect(wakeLockRequest).toHaveBeenCalledTimes(2);
    expect(firstRelease).toHaveBeenCalledOnce();
  });

  it("marks lock inactive when the wake lock release event fires", async () => {
    let releaseListener: (() => void) | undefined;
    wakeLockRequest.mockResolvedValue({
      released: false,
      release: wakeLockRelease,
      addEventListener: (_type: "release", listener: () => void) => {
        releaseListener = listener;
      }
    });

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: wakeLockRequest }
    });

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(latestValue?.mode).toBe("screen-wake-lock");
    expect(latestValue?.active).toBe(true);

    act(() => {
      releaseListener?.();
    });

    expect(latestValue?.mode).toBe("none");
    expect(latestValue?.active).toBe(false);
  });

  it("uses iOS fallback when Wake Lock API is unavailable", async () => {
    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(audioContext.resume).toHaveBeenCalledOnce();
    expect(audioContext.createOscillator).toHaveBeenCalledOnce();
    expect(audioContext.createGain).toHaveBeenCalledOnce();
    expect(oscillator.start).toHaveBeenCalledOnce();
    expect(latestValue?.mode).toBe("ios-fallback");
    expect(latestValue?.active).toBe(true);
  });

  it("does not acquire lock while document is hidden", async () => {
    setVisibilityState("hidden");

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(wakeLockRequest).not.toHaveBeenCalled();
    expect(audioContext.createOscillator).not.toHaveBeenCalled();
    expect(latestValue?.mode).toBe("none");
    expect(latestValue?.active).toBe(false);
  });

  it("keeps mode none when no wake lock API and no audio context are available", async () => {
    vi.unstubAllGlobals();
    const windowWithoutWebkit = window as Window & { webkitAudioContext?: unknown };
    windowWithoutWebkit.webkitAudioContext = undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(latestValue?.mode).toBe("none");
    expect(latestValue?.active).toBe(false);
  });

  it("keeps mode none when wake lock and fallback acquisition both fail", async () => {
    wakeLockRequest.mockRejectedValue(new Error("not allowed"));
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: wakeLockRequest }
    });
    audioContext.resume.mockRejectedValueOnce(new Error("audio blocked"));

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(wakeLockRequest).toHaveBeenCalledWith("screen");
    expect(audioContext.resume).toHaveBeenCalledOnce();
    expect(latestValue?.mode).toBe("none");
    expect(latestValue?.active).toBe(false);
  });

  it("releases wake lock and stops audio fallback", async () => {
    Reflect.deleteProperty(navigator, "wakeLock");

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await Promise.resolve();
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(latestValue?.mode).toBe("ios-fallback");
    expect(latestValue?.active).toBe(true);

    act(() => {
      latestValue?.release();
    });

    expect(oscillator.stop).toHaveBeenCalled();
    expect(audioContext.close).toHaveBeenCalled();
    expect(latestValue?.mode).toBe("none");
    expect(latestValue?.active).toBe(false);
  });

  it("re-acquires after visibility returns while keep-awake is still requested", async () => {
    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      await latestValue?.acquire();
    });

    expect(audioContext.createOscillator).toHaveBeenCalledTimes(1);

    await act(async () => {
      setVisibilityState("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(oscillator.stop).toHaveBeenCalled();

    await act(async () => {
      setVisibilityState("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(audioContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(latestValue?.mode).toBe("ios-fallback");
    expect(latestValue?.active).toBe(true);
  });
});
