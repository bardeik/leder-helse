using HelseLoop.Domain.Workout;

namespace HelseLoop.Domain.Tests;

public class WorkoutSessionStateMachineTests
{
    private static WorkoutSessionState WithTimeRemaining(WorkoutSessionState s, int seconds)
        => s with { TimeRemaining = seconds };

    [Fact]
    public void Start_from_idle_enters_countdown_and_arms_the_timer()
    {
        var state = WorkoutSessionStateMachine.Start(WorkoutSessionState.Initial);

        state.Phase.Should().Be(WorkoutPhase.Countdown);
        state.IsRunning.Should().BeTrue();
        state.TimeRemaining.Should().Be(WorkoutConfig.CountdownSeconds);
    }

    [Fact]
    public void Countdown_advance_transitions_to_first_work_interval()
    {
        var idle = WorkoutSessionState.Initial;
        var countdown = WorkoutSessionStateMachine.Start(idle);

        var work = WorkoutSessionStateMachine.Advance(countdown);

        work.Phase.Should().Be(WorkoutPhase.Work);
        work.IsResting.Should().BeFalse();
        work.TimeRemaining.Should().Be(WorkoutConfig.WorkSeconds);
    }

    [Fact]
    public void Work_advance_at_last_exercise_of_a_non_final_round_enters_round_rest()
    {
        var state = WorkoutSessionState.Initial with
        {
            CurrentRound = 1,
            CurrentExercise = WorkoutConfig.ExercisesPerRound,
            CompletedExercises = 8,
            Phase = WorkoutPhase.Work,
            IsRunning = true
        };

        var next = WorkoutSessionStateMachine.Advance(state);

        next.Phase.Should().Be(WorkoutPhase.RoundRest);
        next.CompletedRounds.Should().Be(1);
        next.CompletedExercises.Should().Be(9);
        next.TimeRemaining.Should().Be(WorkoutConfig.RoundRestSeconds);
    }

    [Fact]
    public void Work_advance_at_last_exercise_of_final_round_completes_the_workout()
    {
        var state = WorkoutSessionState.Initial with
        {
            CurrentRound = WorkoutConfig.TotalRounds,
            CurrentExercise = WorkoutConfig.ExercisesPerRound,
            CompletedExercises = WorkoutConfig.TotalSteps - 1,
            CompletedRounds = WorkoutConfig.TotalRounds - 1,
            Phase = WorkoutPhase.Work,
            IsRunning = true
        };

        var next = WorkoutSessionStateMachine.Advance(state);

        next.Phase.Should().Be(WorkoutPhase.Complete);
        next.IsWorkoutComplete.Should().BeTrue();
        next.IsRunning.Should().BeFalse();
        next.CompletedExercises.Should().Be(WorkoutConfig.TotalSteps);
        next.CompletedRounds.Should().Be(WorkoutConfig.TotalRounds);
    }

    [Fact]
    public void NormalizePersisted_never_autostarts_after_reload()
    {
        var persisted = WorkoutSessionState.Initial with
        {
            IsRunning = true,
            Phase = WorkoutPhase.Work,
            TimeRemaining = 17,
            CurrentExercise = 3,
            CompletedExercises = 2
        };

        var normalized = WorkoutSessionStateMachine.NormalizePersisted(persisted);

        normalized.IsRunning.Should().BeFalse();
        normalized.Phase.Should().Be(WorkoutPhase.Work);
        normalized.TimeRemaining.Should().Be(17);
    }

    [Fact]
    public void NormalizePersisted_treats_transient_countdown_phase_as_idle()
    {
        var persisted = WorkoutSessionState.Initial with { Phase = WorkoutPhase.Countdown, IsRunning = true };

        var normalized = WorkoutSessionStateMachine.NormalizePersisted(persisted);

        normalized.Phase.Should().Be(WorkoutPhase.Idle);
        normalized.IsRunning.Should().BeFalse();
    }

    [Fact]
    public void Tick_ticks_down_then_advances_phase_when_time_expires()
    {
        var running = WorkoutSessionStateMachine.Advance(WorkoutSessionStateMachine.Start(WorkoutSessionState.Initial));
        running = WithTimeRemaining(running with { IsRunning = true }, 2);

        var afterFirst = WorkoutSessionStateMachine.Tick(running);
        afterFirst.TimeRemaining.Should().Be(1);
        afterFirst.Phase.Should().Be(WorkoutPhase.Work);

        var afterSecond = WorkoutSessionStateMachine.Tick(afterFirst);
        afterSecond.Phase.Should().Be(WorkoutPhase.Rest);
        afterSecond.TimeRemaining.Should().Be(WorkoutConfig.RestSeconds);
        afterSecond.CompletedExercises.Should().Be(1);
    }

    [Fact]
    public void GetProgressPercent_returns_zero_at_start_and_one_hundred_when_all_steps_are_done()
    {
        WorkoutSessionStateMachine.GetProgressPercent(WorkoutSessionState.Initial).Should().Be(0);

        var complete = WorkoutSessionState.Initial with
        {
            CompletedExercises = WorkoutConfig.TotalSteps
        };
        WorkoutSessionStateMachine.GetProgressPercent(complete).Should().Be(100);
    }
}
