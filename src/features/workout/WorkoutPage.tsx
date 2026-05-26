"use client";

import { exercises } from "@/features/workout/data/exercises";
import { WorkoutControls } from "@/features/workout/components/WorkoutControls";
import { WorkoutHeader } from "@/features/workout/components/WorkoutHeader";
import { WorkoutSummary } from "@/features/workout/components/WorkoutSummary";
import { TimerDisplay } from "@/features/workout/components/TimerDisplay";
import { ProgressBar } from "@/features/workout/components/ProgressBar";
import { ExerciseList } from "@/features/workout/components/ExerciseList";
import { useWorkoutTimer } from "@/features/workout/hooks/useWorkoutTimer";

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

  function handleReset() {
    const confirmed = window.confirm("Vil du nullstille progresjonen for denne okten?");
    if (!confirmed) {
      return;
    }
    resetWorkout();
  }

  return (
    <section className="workout-layout">
      <WorkoutHeader
        title="Intervallokt"
        description="3 runder, 9 ovelser per runde, 40 sekunder arbeid og 20 sekunder pause."
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
            Aktiv ovelse: <strong>{currentExerciseData.name}</strong>
          </p>
          <p>
            Neste ovelse: <strong>{nextExerciseData?.name ?? "Ingen - siste intervall"}</strong>
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
        onStart={startWorkout}
        onPause={pauseWorkout}
        onReset={handleReset}
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
        <WorkoutSummary completedRounds={completedRounds} totalCompletedSteps={totalCompletedSteps} onRestart={resetWorkout} />
      ) : null}
    </section>
  );
}
