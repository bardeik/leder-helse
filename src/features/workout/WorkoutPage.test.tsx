import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exercises } from "@/features/workout/data/exercises";
import { WorkoutPage } from "@/features/workout/WorkoutPage";
import { useWorkoutAudio } from "@/features/workout/hooks/useWorkoutAudio";
import { useWorkoutTimer } from "@/features/workout/hooks/useWorkoutTimer";
import { useWorkoutWakeLock } from "@/features/workout/hooks/useWorkoutWakeLock";

vi.mock("@/features/workout/hooks/useWorkoutTimer", () => ({
  useWorkoutTimer: vi.fn()
}));

vi.mock("@/features/workout/hooks/useWorkoutAudio", () => ({
  useWorkoutAudio: vi.fn()
}));

vi.mock("@/features/workout/hooks/useWorkoutWakeLock", () => ({
  useWorkoutWakeLock: vi.fn()
}));

describe("WorkoutPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    vi.mocked(useWorkoutTimer).mockReturnValue({
      currentRound: 2,
      currentExercise: 3,
      timeRemaining: 28,
      isRunning: true,
      isResting: false,
      isWorkoutComplete: false,
      phase: "work",
      currentExerciseData: exercises[2],
      nextExerciseData: exercises[3],
      totalCompletedSteps: 12,
      totalSteps: 27,
      progressPercent: 44,
      completedRounds: 1,
      startWorkout: vi.fn(),
      pauseWorkout: vi.fn(),
      resetWorkout: vi.fn()
    });
    vi.mocked(useWorkoutAudio).mockReturnValue({
      initAudio: vi.fn(),
      playCountdownTick: vi.fn(),
      playTransitionBeep: vi.fn(),
      announceNextExercise: vi.fn(),
      muted: false,
      toggleMute: vi.fn()
    });
    vi.mocked(useWorkoutWakeLock).mockReturnValue({
      acquire: vi.fn(),
      release: vi.fn()
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("adds a vibrant work-phase class while the interval is running", async () => {
    await act(async () => {
      root.render(<WorkoutPage />);
    });

    const layout = container.querySelector("section.workout-layout");
    expect(layout).not.toBeNull();
    expect(layout?.className).toContain("workout-layout-phase-work");
    expect(container.textContent).toContain("120 sekunder pause mellom rundene");
  });

  it("announces start when the phase enters work and pause when it enters rest", async () => {
    const playCountdownTick = vi.fn();
    const playTransitionBeep = vi.fn();
    const announceNextExercise = vi.fn();
    vi.mocked(useWorkoutAudio).mockReturnValue({
      initAudio: vi.fn(),
      playCountdownTick,
      playTransitionBeep,
      announceNextExercise,
      muted: false,
      toggleMute: vi.fn()
    });

    vi.mocked(useWorkoutTimer)
      .mockReturnValueOnce({
        currentRound: 1,
        currentExercise: 1,
        timeRemaining: 1,
        isRunning: true,
        isResting: false,
        isWorkoutComplete: false,
        phase: "countdown",
        currentExerciseData: exercises[0],
        nextExerciseData: exercises[1],
        totalCompletedSteps: 0,
        totalSteps: 27,
        progressPercent: 0,
        completedRounds: 0,
        startWorkout: vi.fn(),
        pauseWorkout: vi.fn(),
        resetWorkout: vi.fn()
      })
      .mockReturnValueOnce({
        currentRound: 1,
        currentExercise: 1,
        timeRemaining: 40,
        isRunning: true,
        isResting: false,
        isWorkoutComplete: false,
        phase: "work",
        currentExerciseData: exercises[0],
        nextExerciseData: exercises[1],
        totalCompletedSteps: 1,
        totalSteps: 27,
        progressPercent: 4,
        completedRounds: 0,
        startWorkout: vi.fn(),
        pauseWorkout: vi.fn(),
        resetWorkout: vi.fn()
      })
      .mockReturnValueOnce({
        currentRound: 1,
        currentExercise: 1,
        timeRemaining: 20,
        isRunning: true,
        isResting: true,
        isWorkoutComplete: false,
        phase: "rest",
        currentExerciseData: exercises[0],
        nextExerciseData: exercises[1],
        totalCompletedSteps: 1,
        totalSteps: 27,
        progressPercent: 4,
        completedRounds: 0,
        startWorkout: vi.fn(),
        pauseWorkout: vi.fn(),
        resetWorkout: vi.fn()
      });

    await act(async () => {
      root.render(<WorkoutPage />);
    });

    await act(async () => {
      root.render(<WorkoutPage />);
    });

    await act(async () => {
      root.render(<WorkoutPage />);
    });

    expect(playCountdownTick).toHaveBeenCalledWith(1, "start");
    expect(playCountdownTick).toHaveBeenCalledWith(1, "pause");
    expect(announceNextExercise).toHaveBeenCalledWith(exercises[1]?.name);
  });
});
