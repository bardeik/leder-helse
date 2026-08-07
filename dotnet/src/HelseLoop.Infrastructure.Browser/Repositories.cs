using System.Collections.Concurrent;
using HelseLoop.Application.Abstractions;
using HelseLoop.Domain;

namespace HelseLoop.Infrastructure.Browser;

/// <summary>
/// Placeholder repository backed by an in-memory dictionary. The production
/// browser adapter will marshal these calls to an isolated JS module that
/// talks to IndexedDB (see plan issue B3). Kept in-tree so hosts can boot and
/// Playwright smoke tests can run before the JS interop layer lands.
/// </summary>
public sealed class InMemoryDailyLogRepository : IDailyLogRepository
{
    private readonly ConcurrentDictionary<DateOnly, DailyLog> _store = new();

    public Task<DailyLog?> GetAsync(DateOnly logDate, CancellationToken cancellationToken = default)
        => Task.FromResult(_store.TryGetValue(logDate, out var log) ? log : null);

    public Task<IReadOnlyList<DailyLog>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default)
    {
        var results = _store.Values
            .Where(l => l.Date >= startInclusive && l.Date <= endInclusive)
            .OrderBy(l => l.Date)
            .ToArray();
        return Task.FromResult<IReadOnlyList<DailyLog>>(results);
    }

    public Task UpsertAsync(DailyLog log, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(log);
        _store[log.Date] = log;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DateOnly logDate, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(logDate, out _);
        return Task.CompletedTask;
    }
}

/// <summary>Placeholder in-memory weekly check-in repository.</summary>
public sealed class InMemoryWeeklyCheckInRepository : IWeeklyCheckInRepository
{
    private readonly ConcurrentDictionary<DateOnly, WeeklyCheckIn> _store = new();

    public Task<WeeklyCheckIn?> GetAsync(DateOnly weekStartDate, CancellationToken cancellationToken = default)
        => Task.FromResult(_store.TryGetValue(weekStartDate, out var v) ? v : null);

    public Task<IReadOnlyList<WeeklyCheckIn>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default)
    {
        var results = _store.Values
            .Where(c => c.WeekStartDate >= startInclusive && c.WeekStartDate <= endInclusive)
            .OrderBy(c => c.WeekStartDate)
            .ToArray();
        return Task.FromResult<IReadOnlyList<WeeklyCheckIn>>(results);
    }

    public Task UpsertAsync(WeeklyCheckIn checkIn, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(checkIn);
        _store[checkIn.WeekStartDate] = checkIn;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DateOnly weekStartDate, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(weekStartDate, out _);
        return Task.CompletedTask;
    }
}

/// <summary>Placeholder in-memory workout repository.</summary>
public sealed class InMemoryWorkoutLogRepository : IWorkoutLogRepository
{
    private readonly ConcurrentDictionary<int, WorkoutLog> _store = new();
    private int _nextId;

    public Task<WorkoutLog?> GetAsync(int id, CancellationToken cancellationToken = default)
        => Task.FromResult(_store.TryGetValue(id, out var v) ? v : null);

    public Task<IReadOnlyList<WorkoutLog>> ListByDateAsync(DateOnly logDate, CancellationToken cancellationToken = default)
    {
        var results = _store.Values
            .Where(w => w.Date == logDate)
            .OrderByDescending(w => w.DateTime)
            .ToArray();
        return Task.FromResult<IReadOnlyList<WorkoutLog>>(results);
    }

    public Task<IReadOnlyList<WorkoutLog>> ListByRangeAsync(
        DateOnly startInclusive,
        DateOnly endInclusive,
        CancellationToken cancellationToken = default)
    {
        var results = _store.Values
            .Where(w => w.Date >= startInclusive && w.Date <= endInclusive)
            .OrderByDescending(w => w.DateTime)
            .ToArray();
        return Task.FromResult<IReadOnlyList<WorkoutLog>>(results);
    }

    public Task<int> UpsertAsync(WorkoutLog log, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(log);
        var id = log.Id ?? Interlocked.Increment(ref _nextId);
        _store[id] = log with { Id = id };
        return Task.FromResult(id);
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
