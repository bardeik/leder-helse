namespace HelseLoop.Domain.Workout;

/// <summary>
/// Ordered phases of a Helse Loop workout session. Matches the TypeScript
/// <c>WorkoutPhase</c> string union exactly.
/// </summary>
public enum WorkoutPhase
{
    Idle = 0,
    Countdown = 1,
    Work = 2,
    Rest = 3,
    RoundRest = 4,
    Complete = 5
}

/// <summary>Timing/structure constants for the workout timer.</summary>
public static class WorkoutConfig
{
    public const int TotalRounds = 3;
    public const int ExercisesPerRound = 9;
    public const int WorkSeconds = 40;
    public const int RestSeconds = 20;
    public const int RoundRestSeconds = 120;
    public const int CountdownSeconds = 5;

    /// <summary>Total exercise steps in a full workout.</summary>
    public const int TotalSteps = TotalRounds * ExercisesPerRound;
}

/// <summary>
/// Immutable snapshot of the workout timer. All transitions produce a new
/// <see cref="WorkoutSessionState"/>; the state machine itself owns no side effects.
/// </summary>
public sealed record WorkoutSessionState(
    int CurrentRound,
    int CurrentExercise,
    bool IsRunning,
    bool IsResting,
    int TimeRemaining,
    bool IsWorkoutComplete,
    int CompletedExercises,
    int CompletedRounds,
    WorkoutPhase Phase)
{
    /// <summary>Initial state used when no persisted session exists.</summary>
    public static WorkoutSessionState Initial => new(
        CurrentRound: 1,
        CurrentExercise: 1,
        IsRunning: false,
        IsResting: false,
        TimeRemaining: WorkoutConfig.WorkSeconds,
        IsWorkoutComplete: false,
        CompletedExercises: 0,
        CompletedRounds: 0,
        Phase: WorkoutPhase.Idle);
}
