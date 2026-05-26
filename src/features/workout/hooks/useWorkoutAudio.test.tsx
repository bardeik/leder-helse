import { useEffect } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWorkoutAudio } from "./useWorkoutAudio";

// Shared mock context — methods are reset between tests via vi.clearAllMocks()
const gainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  }
};

const oscillator = {
  connect: vi.fn(),
  type: "sine" as OscillatorType,
  frequency: { value: 0 },
  start: vi.fn(),
  stop: vi.fn()
};

const mockCtx = {
  state: "running" as AudioContextState,
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
  createOscillator: vi.fn().mockReturnValue(oscillator),
  createGain: vi.fn().mockReturnValue(gainNode),
  destination: {}
};

// Use a regular (non-arrow) function so it can be called with `new`
// Returning an object from a constructor makes JS use that object as the instance
function MockAudioContext() {
  return mockCtx;
}

type HookValue = ReturnType<typeof useWorkoutAudio>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useWorkoutAudio();
  useEffect(() => {
    onChange(value);
  }, [onChange, value]);
  return null;
}

describe("useWorkoutAudio", () => {
  let container: HTMLDivElement;
  let root: Root;
  let result: HookValue;

  function renderHook() {
    const onChange = (v: HookValue) => {
      result = v;
    };
    act(() => {
      root.render(<HookHarness onChange={onChange} />);
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockCtx.state = "running";
    vi.stubGlobal("AudioContext", MockAudioContext);
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      root = createRoot(container);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it("initialises without throwing, muted is false", () => {
    renderHook();
    expect(result.muted).toBe(false);
  });

  it("toggleMute toggles muted state", () => {
    renderHook();
    expect(result.muted).toBe(false);

    act(() => result.toggleMute());
    expect(result.muted).toBe(true);

    act(() => result.toggleMute());
    expect(result.muted).toBe(false);
  });

  it("initAudio resumes a suspended AudioContext", () => {
    mockCtx.state = "suspended";
    renderHook();
    act(() => result.initAudio());
    expect(mockCtx.resume).toHaveBeenCalledOnce();
  });

  it("initAudio does not throw when AudioContext is unavailable", () => {
    vi.stubGlobal("AudioContext", undefined);
    renderHook();
    expect(() => act(() => result.initAudio())).not.toThrow();
  });

  it("playCountdownTick uses increasing pitch: 880 -> 1050 -> 1200", () => {
    renderHook();
    act(() => result.initAudio());

    const freqs: number[] = [];
    mockCtx.createOscillator.mockImplementation(() => ({
      connect: vi.fn(),
      type: "sine",
      get frequency() {
        return {
          set value(v: number) {
            freqs.push(v);
          },
          get value() {
            return 0;
          }
        };
      },
      start: vi.fn(),
      stop: vi.fn()
    }));

    act(() => result.playCountdownTick(3));
    act(() => result.playCountdownTick(2));
    act(() => result.playCountdownTick(1));

    expect(freqs[0]).toBe(880);
    expect(freqs[1]).toBe(1050);
    expect(freqs[2]).toBe(1200);
  });

  it("playCountdownTick is silent when muted", () => {
    renderHook();
    act(() => result.initAudio());
    act(() => result.toggleMute());

    act(() => result.playCountdownTick(3));

    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it("playTransitionBeep schedules two tones for work phase", () => {
    renderHook();
    act(() => result.initAudio());

    act(() => result.playTransitionBeep("work"));

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("playTransitionBeep schedules two tones for rest phase", () => {
    renderHook();
    act(() => result.initAudio());

    act(() => result.playTransitionBeep("rest"));

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("playTransitionBeep schedules three tones for complete phase", () => {
    renderHook();
    act(() => result.initAudio());

    act(() => result.playTransitionBeep("complete"));

    // Celebratory triple-tone
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("playTransitionBeep is silent when muted", () => {
    renderHook();
    act(() => result.initAudio());
    act(() => result.toggleMute());

    act(() => result.playTransitionBeep("work"));

    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });
});
