"use client";

import { useEffect, useRef } from "react";
import { exercises } from "@/features/workout/data/exercises";
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

export function WorkoutPage() {
  const {
    currentRound,
    currentExercise,
    timeRemaining,
    isRunning,
    isWorkoutComplete,
    phase,
    currentExerciseData,
    nextExerciseData,
    totalCompletedSteps,
    totalSteps,
    progressPercent,
    completedRounds,
    startWorkout,
    pauseWorkout,
    resetWorkout
  } = useWorkoutTimer();

  const { initAudio, playCountdownTick, playTransitionBeep, muted, toggleMute } = useWorkoutAudio();
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWorkoutWakeLock();

  // Track previous phase to detect transitions without triggering on mount
  const previousPhaseRef = useRef<WorkoutPhase>(phase);

  // Play countdown tick:
  // - During the startup countdown: tick at every second (5, 4, 3, 2, 1)
  // - During work/rest intervals: tick only for the last 3 seconds
  useEffect(() => {
    if (!isRunning || isWorkoutComplete) return;
    if (phase === "countdown" && timeRemaining > 0) {
      playCountdownTick(timeRemaining);
    } else if (phase !== "countdown" && timeRemaining > 0 && timeRemaining <= 3) {
      playCountdownTick(timeRemaining);
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
    const confirmed = window.confirm("Vil du nullstille progresjonen for denne okten?");
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
    <section className="workout-layout">
      <WorkoutHeader
        title="Intervalløkt"
        description="3 runder, 9 øvelser per runde, 40 sekunder arbeid og 20 sekunder pause. 90 sekunder pause mellom rundene."
      />

      <div className="workout-grid">
        <TimerDisplay
          timeRemaining={timeRemaining}
          phase={phase}
          currentRound={currentRound}
          currentExercise={currentExercise}
        />

        <section className="card">
          <h2>Status</h2>
          <p>
            Aktiv øvelse: <strong>{currentExerciseData.name}</strong>
          </p>
          <p>
            Neste øvelse: <strong>{nextExerciseData?.name ?? "Ingen - siste intervall"}</strong>
          </p>
          <small className="muted">{isRunning ? "Okten er i gang." : "Trykk Start for a fortsette."}</small>
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
        exercises={exercises}
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
