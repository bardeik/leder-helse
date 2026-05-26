import { useEffect } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useWorkoutStorage } from "@/features/workout/hooks/useWorkoutStorage";

type HookValue = ReturnType<typeof useWorkoutStorage>;

function HookHarness({ onChange }: { onChange: (value: HookValue) => void }) {
  const value = useWorkoutStorage();

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return null;
}

describe("useWorkoutStorage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
  });

  it("returns null when no value is stored", async () => {
    let latestValue: HookValue | undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    expect(latestValue?.savedState).toBeNull();
  });

  it("returns null when stored value is malformed JSON", async () => {
    window.localStorage.setItem("workoutProgress", "{");
    let latestValue: HookValue | undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    expect(latestValue?.savedState).toBeNull();
  });

  it("restores saved state but forces isRunning to false to prevent autostart", async () => {
    window.localStorage.setItem(
      "workoutProgress",
      JSON.stringify({
        currentRound: 2,
        currentExercise: 4,
        isRunning: true,
        isResting: false,
        timeRemaining: 19,
        isWorkoutComplete: false,
        completedExercises: 12,
        completedRounds: 1,
        phase: "work"
      })
    );
    let latestValue: HookValue | undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    expect(latestValue?.savedState).toMatchObject({
      currentRound: 2,
      currentExercise: 4,
      timeRemaining: 19,
      completedExercises: 12,
      phase: "work",
      isRunning: false
    });
  });

  it("saves state to localStorage via saveWorkoutState", async () => {
    let latestValue: HookValue | undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    const stateToSave = {
      currentRound: 1,
      currentExercise: 2,
      isRunning: false,
      isResting: false,
      timeRemaining: 30,
      isWorkoutComplete: false,
      completedExercises: 1,
      completedRounds: 0,
      phase: "work" as const
    };

    await act(async () => {
      latestValue?.saveWorkoutState(stateToSave);
    });

    const stored = window.localStorage.getItem("workoutProgress");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toMatchObject({ currentRound: 1, currentExercise: 2 });
  });

  it("removes state from localStorage via clearWorkoutState", async () => {
    window.localStorage.setItem("workoutProgress", JSON.stringify({ currentRound: 1 }));
    let latestValue: HookValue | undefined;

    await act(async () => {
      root.render(<HookHarness onChange={(value) => (latestValue = value)} />);
    });

    await act(async () => {
      latestValue?.clearWorkoutState();
    });

    expect(window.localStorage.getItem("workoutProgress")).toBeNull();
    expect(latestValue?.savedState).toBeNull();
  });
});
