"use client";

import { useEffect, useMemo, useRef } from "react";
import { getExercises } from "@/features/workout/data/exercises";
import { WorkoutControls } from "@/features/workout/components/WorkoutControls";
import { WorkoutHeader } from "@/features/workout/components/WorkoutHeader";
import { WorkoutSummary } from "@/features/workout/components/WorkoutSummary";
import { TimerDisplay } from "@/features/workout/components/TimerDisplay";
import { ProgressBar } from "@/features/workout/components/ProgressBar";
import { ExerciseList } from "@/features/workout/components/ExerciseList";
import { useWorkoutTimer } from "@/features/workout/hooks/useWorkoutTimer";
import { useWorkoutAudio } from "@/features/workout/hooks/useWorkoutAudio";
import { useWorkoutWakeLock } from "@/features/workout/hooks/useWorkoutWakeLock";
import type { WorkoutPhase } from "@/features/workout/utils/workoutConfig";
import { useTranslation } from "@/i18n/LanguageProvider";
import { EXERCISES_PER_ROUND, TOTAL_ROUNDS } from "@/features/workout/utils/workoutConfig";

function resolveNextExerciseIndex(phase: WorkoutPhase, currentExercise: number, currentRound: number): number | null {
  if (phase === "complete") {
    return null;
  }

  if (phase === "roundRest") {
    return 1;
  }

  if (phase === "rest") {
    return Math.min(EXERCISES_PER_ROUND, currentExercise + 1);
  }

  if (currentExercise >= EXERCISES_PER_ROUND && currentRound >= TOTAL_ROUNDS) {
    return null;
  }

  if (currentExercise >= EXERCISES_PER_ROUND) {
    return 1;
  }

  return Math.min(EXERCISES_PER_ROUND, currentExercise + 1);
}

export function WorkoutPage() {
  const { locale, translations: t } = useTranslation();
  const {
    currentRound,
    currentExercise,
    timeRemaining,
    isRunning,
    isWorkoutComplete,
    phase,
    totalCompletedSteps,
    totalSteps,
    progressPercent,
    completedRounds,
    startWorkout,
    pauseWorkout,
    resetWorkout
  } = useWorkoutTimer();

  const workoutExercises = useMemo(() => getExercises(locale), [locale]);
  const currentExerciseData = workoutExercises[Math.max(0, currentExercise - 1)] ?? workoutExercises[0];
  const nextExerciseIndex = resolveNextExerciseIndex(phase, currentExercise, currentRound);
  const nextExerciseData = typeof nextExerciseIndex === "number" ? workoutExercises[nextExerciseIndex - 1] : undefined;

  const { initAudio, playCountdownTick, playTransitionBeep, muted, toggleMute } = useWorkoutAudio(locale);
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWorkoutWakeLock();

  // Track previous phase to detect transitions without triggering on mount
  const previousPhaseRef = useRef<WorkoutPhase>(phase);

  // Play countdown tick:
  // - During the startup countdown: tick at every second (5, 4, 3, 2, 1)
  // - During work/rest intervals: tick only for the last 3 seconds
  useEffect(() => {
    if (!isRunning || isWorkoutComplete) return;
    if (phase === "countdown" && timeRemaining > 0) {
      playCountdownTick(timeRemaining, timeRemaining === 1 ? "start" : undefined);
    } else if (phase !== "countdown" && timeRemaining > 0 && timeRemaining <= 3) {
      playCountdownTick(timeRemaining, phase === "work" && timeRemaining === 1 ? "pause" : undefined);
    }
  }, [timeRemaining, isRunning, isWorkoutComplete, phase, playCountdownTick]);

  // Play transition sound when the phase changes
  useEffect(() => {
    const prevPhase = previousPhaseRef.current;
    previousPhaseRef.current = phase;
    // Skip the initial mount (prevPhase === phase since ref is initialised to phase)
    if (prevPhase === phase) return;
    if (phase === "work" || phase === "rest" || phase === "roundRest" || phase === "complete") {
      playTransitionBeep(phase);
    }
  }, [phase, playTransitionBeep]);

  function handleStart() {
    // AudioContext must be created/resumed inside a user-gesture handler
    initAudio();
    startWorkout();
    void acquireWakeLock();
  }

  function handlePause() {
    pauseWorkout();
    releaseWakeLock();
  }

  function handleReset() {
    const confirmed = window.confirm(t.workout.confirmReset);
    if (!confirmed) {
      return;
    }
    releaseWakeLock();
    resetWorkout();
  }

  function handleRestart() {
    releaseWakeLock();
    resetWorkout();
  }

  useEffect(() => {
    if (isWorkoutComplete) {
      releaseWakeLock();
    }
  }, [isWorkoutComplete, releaseWakeLock]);

  return (
    <section className={`workout-layout workout-layout-phase-${phase}`}>
      <WorkoutHeader
        title={t.workout.pageTitle}
        description={t.workout.description}
      />

      <div className="workout-grid">
        <TimerDisplay
          timeRemaining={timeRemaining}
          phase={phase}
          currentRound={currentRound}
          currentExercise={currentExercise}
        />

        <section className="card">
          <h2>{t.workout.statusTitle}</h2>
          <p>
            {t.workout.activeExercise} <strong>{currentExerciseData.name}</strong>
          </p>
          <p>
            {t.workout.nextExercise} <strong>{nextExerciseData?.name ?? t.workout.lastInterval}</strong>
          </p>
          <small className="muted">{isRunning ? t.workout.sessionRunning : t.workout.pressStartToContinue}</small>
        </section>
      </div>

      <ProgressBar
        totalCompletedSteps={totalCompletedSteps}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
      />

      <WorkoutControls
        isRunning={isRunning}
        isWorkoutComplete={isWorkoutComplete}
        muted={muted}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onToggleMute={toggleMute}
      />

      <ExerciseList
        exercises={workoutExercises}
        currentRound={currentRound}
        currentExercise={currentExercise}
        completedExercises={totalCompletedSteps}
        phase={phase}
        isWorkoutComplete={isWorkoutComplete}
      />

      {isWorkoutComplete ? (
        <WorkoutSummary completedRounds={completedRounds} totalCompletedSteps={totalCompletedSteps} onRestart={handleRestart} />
      ) : null}
    </section>
  );
}
