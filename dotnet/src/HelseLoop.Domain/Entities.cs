namespace HelseLoop.Domain;

/// <summary>
/// Daily energy and sleep registration. <see cref="Date"/> uses a <see cref="DateOnly"/>
/// key; the JSON contract represents this as <c>yyyy-MM-dd</c>.
/// </summary>
public sealed record DailyLog(
    DateOnly Date,
    int Energy,
    bool SleepOk,
    double? SleepHours = null,
    string? Notes = null);

/// <summary>Weekly weigh-in and reflection anchored on Monday.</summary>
public sealed record WeeklyCheckIn(
    DateOnly WeekStartDate,
    double WeightKg,
    string? Notes = null,
    string? Adjustment = null);

/// <summary>
/// A completed workout (strength session or walk). <see cref="DateTime"/> is a
/// UTC-normalized instant for stable chronological ordering; <see cref="Date"/>
/// is the day the workout is counted against.
/// </summary>
public sealed record WorkoutLog(
    DateTimeOffset DateTime,
    DateOnly Date,
    WorkoutType Type,
    int? Id = null,
    int? DurationMinutes = null,
    string? Notes = null);

/// <summary>Rollup of a single week's adherence used by the dashboard.</summary>
public sealed record WeeklyAdherence(
    DateOnly WeekStartDate,
    int EnergyDays,
    int SleepDays,
    int Workouts,
    int AdherencePercent,
    HealthStatus Status);

/// <summary>One point in the 6-week trend series.</summary>
public sealed record WeeklyTrendPoint(
    DateOnly WeekStartDate,
    int SleepOkCount,
    double? WeightKg = null,
    double? WeightDeltaKg = null,
    double? EnergyAverage = null);

/// <summary>Weekly workout progress against the strength/walk goals.</summary>
public sealed record WeeklyWorkoutProgress(
    int StrengthWorkouts,
    int Walks,
    int CompletedGoals,
    int RemainingStrengthWorkouts,
    int RemainingWalks,
    int RemainingGoals);
