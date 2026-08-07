using HelseLoop.Application.Abstractions;
using HelseLoop.Domain;

namespace HelseLoop.Application.UseCases;

/// <summary>
/// Typed "next action" hint. Localised strings live in Shared UI; the domain
/// returns a kind + count so parity between languages is trivial.
/// </summary>
public sealed record NextAction(NextActionKind Kind, int Count = 0);

public enum NextActionKind
{
    LogEnergy = 0,
    LogSleep = 1,
    AddStrength = 2,
    AddWalk = 3,
    WeeklyCheckIn = 4
}

/// <summary>Dashboard summary rendered by <see cref="DashboardView"/>.</summary>
public sealed record DashboardSnapshot(
    int AdherencePercent,
    HealthStatus Status,
    WeeklyWeekSummary WeekSummary,
    IReadOnlyList<WorkoutLog> RecentWorkouts,
    IReadOnlyList<NextAction> NextActions,
    WeeklyCheckIn? LatestCheckIn,
    IReadOnlyList<WeeklyTrendPoint> Trends);

public sealed record WeeklyWeekSummary(
    int EnergyDays,
    int SleepDays,
    int StrengthWorkouts,
    int Walks,
    bool WeightLogged,
    int MissingEnergyDays,
    int MissingSleepDays,
    int RemainingStrengthWorkouts,
    int RemainingWalks);

/// <summary>
/// Dashboard orchestration. Pulls six weeks of data and delegates numeric
/// projections to the Domain module.
/// </summary>
public sealed class DashboardUseCases
{
    private readonly IDailyLogRepository _dailyLogs;
    private readonly IWeeklyCheckInRepository _checkIns;
    private readonly IWorkoutLogRepository _workouts;
    private readonly IClock _clock;

    public DashboardUseCases(
        IDailyLogRepository dailyLogs,
        IWeeklyCheckInRepository checkIns,
        IWorkoutLogRepository workouts,
        IClock clock)
    {
        _dailyLogs = dailyLogs ?? throw new ArgumentNullException(nameof(dailyLogs));
        _checkIns = checkIns ?? throw new ArgumentNullException(nameof(checkIns));
        _workouts = workouts ?? throw new ArgumentNullException(nameof(workouts));
        _clock = clock ?? throw new ArgumentNullException(nameof(clock));
    }

    public async Task<DashboardSnapshot> LoadAsync(CancellationToken cancellationToken = default)
    {
        var today = _clock.LocalToday;
        var weekStarts = WeekCalculations.GetRecentWeekStarts(today, 6);
        var start = weekStarts[0];
        var currentWeek = WeekCalculations.GetWeekStartDate(today);

        var dailyTask = _dailyLogs.ListByRangeAsync(start, today, cancellationToken);
        var checkInTask = _checkIns.ListByRangeAsync(start, weekStarts[^1], cancellationToken);
        var workoutTask = _workouts.ListByRangeAsync(start, today, cancellationToken);

        await Task.WhenAll(dailyTask, checkInTask, workoutTask).ConfigureAwait(false);
        var dailyLogs = dailyTask.Result;
        var checkIns = checkInTask.Result;
        var workouts = workoutTask.Result;

        var adherence = AdherenceCalculations.CalculateWeeklyAdherence(currentWeek, dailyLogs, workouts, today);
        var workoutProgress = AdherenceCalculations.CalculateWeeklyWorkoutProgress(currentWeek, workouts);
        var trends = TrendCalculations.BuildWeeklyTrends(weekStarts, dailyLogs, checkIns);
        var weightLogged = checkIns.Any(c => c.WeekStartDate == currentWeek);

        var isInCurrentWeek = today >= currentWeek && today <= currentWeek.AddDays(6);
        var daysElapsed = isInCurrentWeek
            ? Math.Min(7, today.DayNumber - currentWeek.DayNumber + 1)
            : 7;
        var missingEnergy = Math.Max(0, daysElapsed - adherence.EnergyDays);
        var missingSleep = Math.Max(0, daysElapsed - adherence.SleepDays);

        var actions = new List<NextAction>();
        if (missingEnergy > 0)
        {
            actions.Add(new NextAction(NextActionKind.LogEnergy, missingEnergy));
        }
        if (missingSleep > 0)
        {
            actions.Add(new NextAction(NextActionKind.LogSleep, missingSleep));
        }
        if (workoutProgress.RemainingStrengthWorkouts > 0)
        {
            actions.Add(new NextAction(NextActionKind.AddStrength, workoutProgress.RemainingStrengthWorkouts));
        }
        if (workoutProgress.RemainingWalks > 0)
        {
            actions.Add(new NextAction(NextActionKind.AddWalk, workoutProgress.RemainingWalks));
        }
        if (!weightLogged)
        {
            actions.Add(new NextAction(NextActionKind.WeeklyCheckIn));
        }

        var recentWorkouts = workouts
            .OrderByDescending(w => w.DateTime)
            .Take(6)
            .ToArray();

        var latestCheckIn = checkIns.OrderByDescending(c => c.WeekStartDate).FirstOrDefault();

        return new DashboardSnapshot(
            AdherencePercent: adherence.AdherencePercent,
            Status: adherence.Status,
            WeekSummary: new WeeklyWeekSummary(
                EnergyDays: adherence.EnergyDays,
                SleepDays: adherence.SleepDays,
                StrengthWorkouts: workoutProgress.StrengthWorkouts,
                Walks: workoutProgress.Walks,
                WeightLogged: weightLogged,
                MissingEnergyDays: missingEnergy,
                MissingSleepDays: missingSleep,
                RemainingStrengthWorkouts: workoutProgress.RemainingStrengthWorkouts,
                RemainingWalks: workoutProgress.RemainingWalks),
            RecentWorkouts: recentWorkouts,
            NextActions: actions,
            LatestCheckIn: latestCheckIn,
            Trends: trends);
    }
}
