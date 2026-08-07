namespace HelseLoop.Domain.Workout;

/// <summary>
/// Pure workout timer transitions. Owns no clock, storage, or scheduler.
/// Behaviour matches the React <c>useWorkoutTimer</c>/<c>useWorkoutStorage</c>
/// pair, including the "never autostart after reload" contract enforced by
/// <see cref="NormalizePersisted"/>.
/// </summary>
public static class WorkoutSessionStateMachine
{
    /// <summary>
    /// Sanitises persisted state loaded from storage. Never resumes with
    /// <c>IsRunning=true</c>; ignores the transient <see cref="WorkoutPhase.Countdown"/>
    /// phase; clamps counters into supported ranges.
    /// </summary>
    public static WorkoutSessionState NormalizePersisted(WorkoutSessionState raw)
    {
        ArgumentNullException.ThrowIfNull(raw);

        var phase = raw.Phase == WorkoutPhase.Countdown ? WorkoutPhase.Idle : raw.Phase;
        var isComplete = raw.IsWorkoutComplete || phase == WorkoutPhase.Complete;
        if (isComplete)
        {
            phase = WorkoutPhase.Complete;
        }

        var currentRound = Clamp(raw.CurrentRound, 1, WorkoutConfig.TotalRounds);
        var currentExercise = Clamp(raw.CurrentExercise, 1, WorkoutConfig.ExercisesPerRound);
        var completedExercises = Clamp(raw.CompletedExercises, 0, WorkoutConfig.TotalSteps);
        var completedRounds = Clamp(raw.CompletedRounds, 0, WorkoutConfig.TotalRounds);
        var timeRemaining = isComplete
            ? 0
            : Clamp(raw.TimeRemaining, 0, 60 * 60);
        var isResting = phase is WorkoutPhase.Rest or WorkoutPhase.RoundRest;

        return raw with
        {
            CurrentRound = currentRound,
            CurrentExercise = currentExercise,
            CompletedExercises = completedExercises,
            CompletedRounds = completedRounds,
            IsRunning = false,
            IsResting = isResting,
            TimeRemaining = timeRemaining,
            IsWorkoutComplete = isComplete,
            Phase = phase
        };
    }

    /// <summary>
    /// User presses Start. From <see cref="WorkoutPhase.Idle"/> the timer enters
    /// a 5-second countdown; from other phases it just resumes ticking.
    /// </summary>
    public static WorkoutSessionState Start(WorkoutSessionState state)
    {
        if (state.IsWorkoutComplete)
        {
            return state;
        }

        if (state.Phase == WorkoutPhase.Idle)
        {
            return state with
            {
                IsRunning = true,
                IsResting = false,
                Phase = WorkoutPhase.Countdown,
                TimeRemaining = WorkoutConfig.CountdownSeconds
            };
        }

        return state with { IsRunning = true };
    }

    /// <summary>User presses Pause. Time and phase are preserved.</summary>
    public static WorkoutSessionState Pause(WorkoutSessionState state)
        => state with { IsRunning = false };

    /// <summary>User confirms Reset. Returns the canonical initial state.</summary>
    public static WorkoutSessionState Reset() => WorkoutSessionState.Initial;

    /// <summary>
    /// Advances by one tick. When the timer is running and there is still time
    /// left, decrements the counter; otherwise advances to the next phase.
    /// </summary>
    public static WorkoutSessionState Tick(WorkoutSessionState state)
    {
        if (!state.IsRunning || state.IsWorkoutComplete)
        {
            return state;
        }

        if (state.TimeRemaining > 1)
        {
            return state with { TimeRemaining = state.TimeRemaining - 1 };
        }

        return Advance(state);
    }

    /// <summary>
    /// Phase transition applied when a countdown reaches zero. Public so
    /// application code can preview or drive transitions without ticking.
    /// </summary>
    public static WorkoutSessionState Advance(WorkoutSessionState previous)
    {
        switch (previous.Phase)
        {
            case WorkoutPhase.Countdown:
                return previous with
                {
                    IsResting = false,
                    Phase = WorkoutPhase.Work,
                    TimeRemaining = WorkoutConfig.WorkSeconds
                };

            case WorkoutPhase.Work:
                {
                    var completedExercises = Math.Min(
                        WorkoutConfig.TotalSteps,
                        previous.CompletedExercises + 1);
                    var lastExerciseInRound = previous.CurrentExercise == WorkoutConfig.ExercisesPerRound;
                    var lastRound = previous.CurrentRound == WorkoutConfig.TotalRounds;

                    if (lastExerciseInRound && lastRound)
                    {
                        return previous with
                        {
                            IsRunning = false,
                            IsResting = false,
                            IsWorkoutComplete = true,
                            Phase = WorkoutPhase.Complete,
                            TimeRemaining = 0,
                            CompletedExercises = completedExercises,
                            CompletedRounds = WorkoutConfig.TotalRounds
                        };
                    }

                    if (lastExerciseInRound)
                    {
                        return previous with
                        {
                            IsResting = true,
                            Phase = WorkoutPhase.RoundRest,
                            TimeRemaining = WorkoutConfig.RoundRestSeconds,
                            CompletedExercises = completedExercises,
                            CompletedRounds = previous.CurrentRound
                        };
                    }

                    return previous with
                    {
                        IsResting = true,
                        Phase = WorkoutPhase.Rest,
                        TimeRemaining = WorkoutConfig.RestSeconds,
                        CompletedExercises = completedExercises
                    };
                }

            case WorkoutPhase.Rest:
                return previous with
                {
                    CurrentExercise = Math.Min(
                        WorkoutConfig.ExercisesPerRound,
                        previous.CurrentExercise + 1),
                    IsResting = false,
                    Phase = WorkoutPhase.Work,
                    TimeRemaining = WorkoutConfig.WorkSeconds
                };

            case WorkoutPhase.RoundRest:
                return previous with
                {
                    CurrentRound = Math.Min(
                        WorkoutConfig.TotalRounds,
                        previous.CurrentRound + 1),
                    CurrentExercise = 1,
                    IsResting = false,
                    Phase = WorkoutPhase.Work,
                    TimeRemaining = WorkoutConfig.WorkSeconds
                };

            default:
                return previous;
        }
    }

    /// <summary>
    /// Percent-complete based on total exercise steps. Rounded like the TypeScript
    /// helper (nearest, ties away from zero).
    /// </summary>
    public static int GetProgressPercent(WorkoutSessionState state)
        => (int)Math.Round(
            state.CompletedExercises / (double)WorkoutConfig.TotalSteps * 100.0,
            MidpointRounding.AwayFromZero);

    private static int Clamp(int value, int min, int max)
        => Math.Max(min, Math.Min(max, value));
}
