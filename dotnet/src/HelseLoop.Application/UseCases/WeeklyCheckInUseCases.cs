using HelseLoop.Application.Abstractions;
using HelseLoop.Domain;

namespace HelseLoop.Application.UseCases;

/// <summary>Weekly check-in state exposed to the UI.</summary>
public sealed record WeeklyCheckInState(
    DateOnly WeekStartDate,
    double WeightKg,
    string Notes,
    string Adjustment);

/// <summary>
/// Weekly check-in orchestration ported from <c>useWeeklyCheckIn</c>. Navigation
/// bounds match the app: the current Monday plus the two preceding Mondays.
/// </summary>
public sealed class WeeklyCheckInUseCases
{
    /// <summary>Fallback weight when neither the current nor previous week has data.</summary>
    public const double DefaultWeightKg = 80.0;

    private const int MaxPastWeeks = 2;

    private readonly IWeeklyCheckInRepository _repository;
    private readonly IClock _clock;

    public WeeklyCheckInUseCases(IWeeklyCheckInRepository repository, IClock clock)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _clock = clock ?? throw new ArgumentNullException(nameof(clock));
    }

    public DateOnly MaxWeekStart => WeekCalculations.GetWeekStartDate(_clock.LocalToday);
    public DateOnly MinWeekStart => MaxWeekStart.AddDays(-MaxPastWeeks * 7);

    public bool CanGoBack(DateOnly weekStart) => weekStart > MinWeekStart;
    public bool CanGoForward(DateOnly weekStart) => weekStart < MaxWeekStart;

    /// <summary>
    /// Loads the selected week and computes the initial weight the UI should show.
    /// Existing value wins, else the previous week's weight, else the default.
    /// </summary>
    public async Task<WeeklyCheckInState> LoadAsync(DateOnly weekStart, CancellationToken cancellationToken = default)
    {
        var current = await _repository.GetAsync(weekStart, cancellationToken).ConfigureAwait(false);
        var previous = await _repository.GetAsync(weekStart.AddDays(-7), cancellationToken).ConfigureAwait(false);

        var weight = ResolveInitialWeight(current?.WeightKg, previous?.WeightKg);

        return new WeeklyCheckInState(
            WeekStartDate: weekStart,
            WeightKg: weight,
            Notes: current?.Notes ?? string.Empty,
            Adjustment: current?.Adjustment ?? string.Empty);
    }

    public static double ResolveInitialWeight(double? currentWeekWeight, double? previousWeekWeight)
        => currentWeekWeight ?? previousWeekWeight ?? DefaultWeightKg;

    public async Task<SaveOutcome> SaveAsync(WeeklyCheckInState state, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(state);

        if (state.WeightKg <= 0 || state.WeightKg > ValueRanges.WeightKgMax)
        {
            return SaveOutcome.Failure("weight_out_of_range");
        }
        if (state.Notes.Length > TextLimits.NotesMaxLength)
        {
            return SaveOutcome.Failure("notes_too_long");
        }
        if (state.Adjustment.Length > TextLimits.AdjustmentMaxLength)
        {
            return SaveOutcome.Failure("adjustment_too_long");
        }

        var checkIn = new WeeklyCheckIn(
            WeekStartDate: state.WeekStartDate,
            WeightKg: state.WeightKg,
            Notes: string.IsNullOrWhiteSpace(state.Notes) ? null : state.Notes.Trim(),
            Adjustment: string.IsNullOrWhiteSpace(state.Adjustment) ? null : state.Adjustment.Trim());

        await _repository.UpsertAsync(checkIn, cancellationToken).ConfigureAwait(false);
        return SaveOutcome.Ok;
    }
}
