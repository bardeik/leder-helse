using HelseLoop.Application.Abstractions;
using HelseLoop.Domain;

namespace HelseLoop.Application.UseCases;

/// <summary>
/// Result of a save operation. Typed so the UI can localise failures without
/// parsing exception text.
/// </summary>
public sealed record SaveOutcome(bool Success, string? ErrorCode = null)
{
    public static SaveOutcome Ok { get; } = new(true);
    public static SaveOutcome Failure(string errorCode) => new(false, errorCode);
}

/// <summary>Daily-log state exposed to the UI.</summary>
public sealed record DailyLogState(
    DateOnly Date,
    int Energy,
    bool SleepOk,
    double? SleepHours,
    string? Notes)
{
    public static DailyLogState CreateDefault(DateOnly date)
        => new(date, Energy: 3, SleepOk: true, SleepHours: null, Notes: null);
}

/// <summary>
/// Daily-log orchestration ported from the TypeScript <c>useLogToday</c> hook.
/// Bounds match the app: today plus the previous 13 days (14 days total).
/// </summary>
public sealed class DailyLogUseCases
{
    /// <summary>Number of days before today that remain navigable.</summary>
    public const int MaxPastDays = 13;

    private readonly IDailyLogRepository _dailyLogs;
    private readonly IClock _clock;

    public DailyLogUseCases(IDailyLogRepository dailyLogs, IClock clock)
    {
        _dailyLogs = dailyLogs ?? throw new ArgumentNullException(nameof(dailyLogs));
        _clock = clock ?? throw new ArgumentNullException(nameof(clock));
    }

    public DateOnly Today => _clock.LocalToday;
    public DateOnly MinDate => _clock.LocalToday.AddDays(-MaxPastDays);

    public bool CanGoBack(DateOnly selectedDate) => selectedDate > MinDate;
    public bool CanGoForward(DateOnly selectedDate) => selectedDate < Today;

    /// <summary>
    /// Loads the log for <paramref name="date"/>. Returns a default snapshot when
    /// no data exists yet. The current TypeScript app also writes this default
    /// on visit; that persistence side-effect is deferred to
    /// <see cref="EnsureDefaultAsync"/> so we can turn it off per the migration
    /// plan (A3 decision).
    /// </summary>
    public async Task<DailyLogState> LoadAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        var log = await _dailyLogs.GetAsync(date, cancellationToken).ConfigureAwait(false);
        if (log is null)
        {
            return DailyLogState.CreateDefault(date);
        }

        return new DailyLogState(log.Date, log.Energy, log.SleepOk, log.SleepHours, log.Notes);
    }

    /// <summary>Persist the default record so it counts towards adherence.</summary>
    public Task EnsureDefaultAsync(DateOnly date, CancellationToken cancellationToken = default)
        => SaveAsync(DailyLogState.CreateDefault(date), cancellationToken);

    public async Task<SaveOutcome> SaveAsync(DailyLogState state, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(state);

        if (state.Energy is < ValueRanges.EnergyMin or > ValueRanges.EnergyMax)
        {
            return SaveOutcome.Failure("energy_out_of_range");
        }
        if (state.SleepHours is { } hours && (hours <= 0 || hours > ValueRanges.SleepHoursMax))
        {
            return SaveOutcome.Failure("sleep_hours_out_of_range");
        }
        if (state.Notes is { Length: > TextLimits.NotesMaxLength })
        {
            return SaveOutcome.Failure("notes_too_long");
        }

        var trimmedNotes = string.IsNullOrWhiteSpace(state.Notes) ? null : state.Notes.Trim();

        var log = new DailyLog(
            Date: state.Date,
            Energy: state.Energy,
            SleepOk: state.SleepOk,
            SleepHours: state.SleepHours,
            Notes: trimmedNotes);

        await _dailyLogs.UpsertAsync(log, cancellationToken).ConfigureAwait(false);
        return SaveOutcome.Ok;
    }
}
