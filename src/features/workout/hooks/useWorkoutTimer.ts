"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { exercises, type WorkoutExercise } from "@/features/workout/data/exercises";
import { useWorkoutStorage, type WorkoutStoredState } from "@/features/workout/hooks/useWorkoutStorage";
import {
  EXERCISES_PER_ROUND,
  REST_SECONDS,
  ROUND_REST_SECONDS,
  TOTAL_ROUNDS,
  WORK_SECONDS,
  type WorkoutPhase
} from "@/features/workout/utils/workoutConfig";
import {
  calculateProgress,
  getNextExercise,
  isLastExerciseInRound,
  isLastRound
} from "@/features/workout/utils/workoutHelpers";

const TOTAL_STEPS = TOTAL_ROUNDS * EXERCISES_PER_ROUND;

function createInitialState(savedState: WorkoutStoredState | null): WorkoutStoredState {
  if (savedState) {
    return savedState;
  }

  return {
    currentRound: 1,
    currentExercise: 1,
    isRunning: false,
    isResting: false,
    timeRemaining: WORK_SECONDS,
    isWorkoutComplete: false,
    completedExercises: 0,
    completedRounds: 0,
    phase: "idle"
  };
}

function resolveNextExerciseData(
  phase: WorkoutPhase,
  currentExercise: number,
  currentRound: number
): WorkoutExercise | undefined {
  if (phase === "complete") {
    return undefined;
  }

  if (phase === "roundRest") {
    return exercises[0];
  }

  if (phase === "rest") {
    return getNextExercise(currentExercise, exercises);
  }

  if (isLastExerciseInRound(currentExercise, EXERCISES_PER_ROUND)) {
    if (isLastRound(currentRound, TOTAL_ROUNDS)) {
      return undefined;
    }
    return exercises[0];
  }

  return getNextExercise(currentExercise, exercises);
}

function advanceWorkoutState(previous: WorkoutStoredState): WorkoutStoredState {
  if (previous.phase === "work") {
    const completedExercises = Math.min(TOTAL_STEPS, previous.completedExercises + 1);
    const lastExerciseInRound = isLastExerciseInRound(previous.currentExercise, EXERCISES_PER_ROUND);
    const lastRoundReached = isLastRound(previous.currentRound, TOTAL_ROUNDS);

    if (lastExerciseInRound && lastRoundReached) {
      return {
        ...previous,
        isRunning: false,
        isResting: false,
        isWorkoutComplete: true,
        phase: "complete",
        timeRemaining: 0,
        completedExercises,
        completedRounds: TOTAL_ROUNDS
      };
    }

    if (lastExerciseInRound) {
      return {
        ...previous,
        isResting: true,
        phase: "roundRest",
        timeRemaining: ROUND_REST_SECONDS,
        completedExercises,
        completedRounds: previous.currentRound
      };
    }

    return {
      ...previous,
      isResting: true,
      phase: "rest",
      timeRemaining: REST_SECONDS,
      completedExercises
    };
  }

  if (previous.phase === "rest") {
    return {
      ...previous,
      currentExercise: Math.min(EXERCISES_PER_ROUND, previous.currentExercise + 1),
      isResting: false,
      phase: "work",
      timeRemaining: WORK_SECONDS
    };
  }

  if (previous.phase === "roundRest") {
    return {
      ...previous,
      currentRound: Math.min(TOTAL_ROUNDS, previous.currentRound + 1),
      currentExercise: 1,
      isResting: false,
      phase: "work",
      timeRemaining: WORK_SECONDS
    };
  }

  return previous;
}

export function useWorkoutTimer() {
  const { savedState, saveWorkoutState, clearWorkoutState } = useWorkoutStorage();
  const [state, setState] = useState<WorkoutStoredState>(() => createInitialState(savedState));
  const skipPersistRef = useRef(false);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }

    saveWorkoutState(state);
  }, [saveWorkoutState, state]);

  useEffect(() => {
    if (!state.isRunning || state.isWorkoutComplete) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setState((previous) => {
        if (!previous.isRunning || previous.isWorkoutComplete) {
          return previous;
        }

        if (previous.timeRemaining > 1) {
          return {
            ...previous,
            timeRemaining: previous.timeRemaining - 1
          };
        }

        return advanceWorkoutState(previous);
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.isRunning, state.isWorkoutComplete]);

  const currentExerciseData = useMemo(
    () => exercises[Math.max(0, state.currentExercise - 1)] ?? exercises[0],
    [state.currentExercise]
  );
  const nextExerciseData = useMemo(
    () => resolveNextExerciseData(state.phase, state.currentExercise, state.currentRound),
    [state.currentExercise, state.currentRound, state.phase]
  );
  const totalCompletedSteps = state.completedExercises;
  const totalSteps = TOTAL_STEPS;
  const progressPercent = calculateProgress(totalCompletedSteps, totalSteps);

  function startWorkout() {
    setState((previous) => {
      if (previous.isWorkoutComplete) {
        return previous;
      }

      if (previous.phase === "idle") {
        return {
          ...previous,
          isRunning: true,
          isResting: false,
          phase: "work",
          timeRemaining: previous.timeRemaining > 0 ? previous.timeRemaining : WORK_SECONDS
        };
      }

      return {
        ...previous,
        isRunning: true
      };
    });
  }

  function pauseWorkout() {
    setState((previous) => ({
      ...previous,
      isRunning: false
    }));
  }

  function resetWorkout() {
    skipPersistRef.current = true;
    clearWorkoutState();
    setState(createInitialState(null));
  }

  return {
    currentRound: state.currentRound,
    currentExercise: state.currentExercise,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    isResting: state.isResting,
    isWorkoutComplete: state.isWorkoutComplete,
    phase: state.phase,
    currentExerciseData,
    nextExerciseData,
    totalCompletedSteps,
    totalSteps,
    progressPercent,
    completedRounds: state.completedRounds,
    startWorkout,
    pauseWorkout,
    resetWorkout
  };
}
