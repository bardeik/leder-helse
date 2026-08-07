using HelseLoop.Domain;

namespace HelseLoop.Application.Abstractions;

/// <summary>
/// Provides the current instant/day. Injected everywhere so use cases stay
/// deterministic and testable, and so local vs. UTC semantics can be chosen
/// explicitly per host.
/// </summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }

    /// <summary>The user-facing "today" in local time.</summary>
    DateOnly LocalToday { get; }
}

/// <summary>Default clock backed by <see cref="DateTimeOffset.UtcNow"/>.</summary>
public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
    public DateOnly LocalToday => DateOnly.FromDateTime(DateTime.Now);
}

/// <summary>Repository over daily energy/sleep logs.</summary>
public interface IDailyLogRepository
{
    Task<DailyLog?> GetAsync(DateOnly logDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DailyLog>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default);

    Task UpsertAsync(DailyLog log, CancellationToken cancellationToken = default);

    Task DeleteAsync(DateOnly logDate, CancellationToken cancellationToken = default);
}

/// <summary>Repository over weekly weigh-ins.</summary>
public interface IWeeklyCheckInRepository
{
    Task<WeeklyCheckIn?> GetAsync(DateOnly weekStartDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WeeklyCheckIn>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default);

    Task UpsertAsync(WeeklyCheckIn checkIn, CancellationToken cancellationToken = default);

    Task DeleteAsync(DateOnly weekStartDate, CancellationToken cancellationToken = default);
}

/// <summary>Repository over completed workouts.</summary>
public interface IWorkoutLogRepository
{
    Task<WorkoutLog?> GetAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkoutLog>> ListByDateAsync(DateOnly logDate, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkoutLog>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default);

    /// <summary>Inserts or updates the workout and returns its persisted id.</summary>
    Task<int> UpsertAsync(WorkoutLog log, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
