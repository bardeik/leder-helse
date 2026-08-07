using HelseLoop.Application.Abstractions;
using HelseLoop.Domain;

namespace HelseLoop.Application.UseCases;

/// <summary>
/// Workout logging (add/list/delete). The workout timer session lives in its
/// own coordinator; here we only touch persisted workout records.
/// </summary>
public sealed class WorkoutLogUseCases
{
    private readonly IWorkoutLogRepository _repository;
    private readonly IClock _clock;

    public WorkoutLogUseCases(IWorkoutLogRepository repository, IClock clock)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _clock = clock ?? throw new ArgumentNullException(nameof(clock));
    }

    public Task<IReadOnlyList<WorkoutLog>> ListForDateAsync(DateOnly date, CancellationToken cancellationToken = default)
        => _repository.ListByDateAsync(date, cancellationToken);

    /// <summary>
    /// Adds a quick workout for <paramref name="date"/>. For past dates we use
    /// noon UTC so ordering is stable regardless of when the entry was created.
    /// </summary>
    public async Task<WorkoutLog> AddQuickAsync(
        DateOnly date,
        WorkoutType type,
        int? durationMinutes = null,
        CancellationToken cancellationToken = default)
    {
        if (durationMinutes is { } minutes && (minutes <= 0 || minutes > ValueRanges.WorkoutDurationMinutesMax))
        {
            throw new ArgumentOutOfRangeException(nameof(durationMinutes), minutes, "Duration must be within 1-300 minutes.");
        }

        var today = _clock.LocalToday;
        var dateTime = date == today
            ? _clock.UtcNow
            : new DateTimeOffset(date.ToDateTime(new TimeOnly(12, 0)), TimeSpan.Zero);

        var log = new WorkoutLog(
            DateTime: dateTime,
            Date: date,
            Type: type,
            DurationMinutes: durationMinutes);

        var id = await _repository.UpsertAsync(log, cancellationToken).ConfigureAwait(false);
        return log with { Id = id };
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);
}
