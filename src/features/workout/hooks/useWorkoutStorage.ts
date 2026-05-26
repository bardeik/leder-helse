"use client";

import { useCallback, useState } from "react";
import {
  EXERCISES_PER_ROUND,
  TOTAL_ROUNDS,
  WORK_SECONDS,
  type WorkoutPhase
} from "@/features/workout/utils/workoutConfig";

const STORAGE_KEY = "workoutProgress";
const TOTAL_STEPS = TOTAL_ROUNDS * EXERCISES_PER_ROUND;

export interface WorkoutStoredState {
  currentRound: number;
  currentExercise: number;
  isRunning: boolean;
  isResting: boolean;
  timeRemaining: number;
  isWorkoutComplete: boolean;
  completedExercises: number;
  completedRounds: number;
  phase: WorkoutPhase;
}

function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.trunc(numeric)));
}

function normalizePhase(value: unknown): WorkoutPhase {
  if (value === "idle" || value === "work" || value === "rest" || value === "roundRest" || value === "complete") {
    return value;
  }

  return "idle";
}

function normalizeStoredState(input: unknown): WorkoutStoredState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const raw = input as Partial<WorkoutStoredState>;
  const phase = normalizePhase(raw.phase);
  const isComplete = Boolean(raw.isWorkoutComplete) || phase === "complete";
  const currentRound = clampInteger(raw.currentRound, 1, TOTAL_ROUNDS, 1);
  const currentExercise = clampInteger(raw.currentExercise, 1, EXERCISES_PER_ROUND, 1);
  const completedExercises = clampInteger(raw.completedExercises, 0, TOTAL_STEPS, 0);
  const completedRounds = clampInteger(raw.completedRounds, 0, TOTAL_ROUNDS, 0);

  return {
    currentRound,
    currentExercise,
    // Never autostart from persisted state after reload.
    isRunning: false,
    isResting: phase === "rest" || phase === "roundRest",
    timeRemaining: isComplete ? 0 : clampInteger(raw.timeRemaining, 0, 60 * 60, WORK_SECONDS),
    isWorkoutComplete: isComplete,
    completedExercises,
    completedRounds,
    phase: isComplete ? "complete" : phase
  };
}

function readStoredState(): WorkoutStoredState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return normalizeStoredState(parsed);
  } catch {
    return null;
  }
}

export function useWorkoutStorage() {
  const [savedState, setSavedState] = useState<WorkoutStoredState | null>(() => readStoredState());

  const saveWorkoutState = useCallback((state: WorkoutStoredState) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSavedState(state);
    } catch {
      // Intentionally ignore storage write errors so timer logic can continue in-memory.
    }
  }, []);

  const clearWorkoutState = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setSavedState(null);
    } catch {
      // Intentionally ignore storage delete errors so reset can continue in-memory.
    }
  }, []);

  return {
    savedState,
    saveWorkoutState,
    clearWorkoutState
  };
}
