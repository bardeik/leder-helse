import { act, cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { useWorkoutTimer } from "@/features/workout/hooks/useWorkoutTimer";
import { ROUND_REST_SECONDS } from "@/features/workout/utils/workoutConfig";

type HookValue = ReturnType<typeof useWorkoutTimer>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useWorkoutTimer();

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return null;
}

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("useWorkoutTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(async () => {
    cleanup();
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("does not autostart when persisted state had isRunning=true", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 1,
        currentExercise: 3,
        isRunning: true,
        isResting: false,
        timeRemaining: 17,
        isWorkoutComplete: false,
        completedExercises: 2,
        completedRounds: 0,
        phase: "work"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(latestValue?.isRunning).toBe(false);
    expect(latestValue?.phase).toBe("work");
    expect(latestValue?.timeRemaining).toBe(17);
  });

  it("starts from idle phase with correct initial state when no progress is saved", async () => {
    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    expect(latestValue?.phase).toBe("idle");
    expect(latestValue?.currentRound).toBe(1);
    expect(latestValue?.currentExercise).toBe(1);
    expect(latestValue?.isRunning).toBe(false);
    expect(latestValue?.totalCompletedSteps).toBe(0);
    expect(latestValue?.progressPercent).toBe(0);

    // Start from idle — should enter the 5-second countdown first
    await act(async () => {
      latestValue?.startWorkout();
    });

    expect(latestValue?.phase).toBe("countdown");
    expect(latestValue?.isRunning).toBe(true);
    expect(latestValue?.timeRemaining).toBe(5);

    // After the countdown expires the phase advances to work
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(latestValue?.phase).toBe("work");
    expect(latestValue?.isRunning).toBe(true);
  });

  it("transitions from work to rest and marks one completed exercise", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 1,
        currentExercise: 1,
        isRunning: false,
        isResting: false,
        timeRemaining: 1,
        isWorkoutComplete: false,
        completedExercises: 0,
        completedRounds: 0,
        phase: "work"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    // Start the workout first so React can process the state update and set up the interval.
    await act(async () => {
      latestValue?.startWorkout();
    });

    // Now advance the timer — the interval is set up and can fire.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(latestValue?.phase).toBe("rest");
    expect(latestValue?.isResting).toBe(true);
    expect(latestValue?.totalCompletedSteps).toBe(1);
    expect(latestValue?.currentExercise).toBe(1);
  });

  it("transitions from rest to the next exercise", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 1,
        currentExercise: 1,
        isRunning: false,
        isResting: true,
        timeRemaining: 1,
        isWorkoutComplete: false,
        completedExercises: 1,
        completedRounds: 0,
        phase: "rest"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    await act(async () => {
      latestValue?.startWorkout();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(latestValue?.phase).toBe("work");
    expect(latestValue?.currentExercise).toBe(2);
    expect(latestValue?.isResting).toBe(false);
  });

  it("enters roundRest after completing the last exercise in a non-final round", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 1,
        currentExercise: 9,
        isRunning: false,
        isResting: false,
        timeRemaining: 1,
        isWorkoutComplete: false,
        completedExercises: 8,
        completedRounds: 0,
        phase: "work"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    await act(async () => {
      latestValue?.startWorkout();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(latestValue?.phase).toBe("roundRest");
    expect(latestValue?.completedRounds).toBe(1);
    expect(latestValue?.totalCompletedSteps).toBe(9);
    expect(latestValue?.timeRemaining).toBe(ROUND_REST_SECONDS);
    // Next exercise should be the first exercise of the next round
    expect(latestValue?.nextExerciseData?.id).toBe(1);
  });

  it("marks workout complete after last exercise in final round", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 3,
        currentExercise: 9,
        isRunning: false,
        isResting: false,
        timeRemaining: 1,
        isWorkoutComplete: false,
        completedExercises: 26,
        completedRounds: 2,
        phase: "work"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    // Start the workout first so React can process the state update and set up the interval.
    await act(async () => {
      latestValue?.startWorkout();
    });

    // Now advance the timer — the interval is set up and can fire.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(latestValue?.phase).toBe("complete");
    expect(latestValue?.isWorkoutComplete).toBe(true);
    expect(latestValue?.isRunning).toBe(false);
    expect(latestValue?.totalCompletedSteps).toBe(27);
    expect(latestValue?.completedRounds).toBe(3);
  });

  it("pauses a running workout", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 1,
        currentExercise: 2,
        isRunning: false,
        isResting: false,
        timeRemaining: 30,
        isWorkoutComplete: false,
        completedExercises: 1,
        completedRounds: 0,
        phase: "work"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    await act(async () => {
      latestValue?.startWorkout();
    });

    expect(latestValue?.isRunning).toBe(true);

    await act(async () => {
      latestValue?.pauseWorkout();
    });

    expect(latestValue?.isRunning).toBe(false);
    expect(latestValue?.phase).toBe("work");
  });

  it("clears localStorage on reset", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 2,
        currentExercise: 4,
        isRunning: false,
        isResting: true,
        timeRemaining: 20,
        isWorkoutComplete: false,
        completedExercises: 12,
        completedRounds: 1,
        phase: "rest"
      })
    );

    let latestValue: HookValue | undefined;

    await act(async () => {
      render(<HookHarness onChange={(value) => (latestValue = value)} />);
      await flushPromises();
    });

    await act(async () => {
      latestValue?.resetWorkout();
      await flushPromises();
    });

    expect(window.localStorage.getItem("workoutProgress")).toBeNull();
    expect(latestValue?.phase).toBe("idle");
    expect(latestValue?.currentRound).toBe(1);
  });
});
