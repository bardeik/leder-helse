using System.Globalization;
using HelseLoop.Domain;

namespace HelseLoop.Domain.Tests;

public class AdherenceCalculationsTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);
    private static DateTimeOffset T(string iso) => DateTimeOffset.Parse(iso, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);

    [Fact]
    public void Calculates_weekly_adherence_matches_typescript_fixture()
    {
        // Mirrors the TypeScript "calculates weekly adherence" test case.
        var dailyLogs = new[]
        {
            new DailyLog(D("2026-04-13"), Energy: 4, SleepOk: true),
            new DailyLog(D("2026-04-14"), Energy: 4, SleepOk: true),
            new DailyLog(D("2026-04-15"), Energy: 3, SleepOk: false)
        };

        var workouts = new[]
        {
            new WorkoutLog(T("2026-04-13T07:00:00Z"), D("2026-04-13"), WorkoutType.Strength),
            new WorkoutLog(T("2026-04-15T07:00:00Z"), D("2026-04-15"), WorkoutType.Walk)
        };

        var result = AdherenceCalculations.CalculateWeeklyAdherence(
            D("2026-04-13"), dailyLogs, workouts, today: null);

        result.EnergyDays.Should().Be(3);
        result.SleepDays.Should().Be(3);
        result.Workouts.Should().Be(2);
        result.AdherencePercent.Should().Be(38);
        result.Status.Should().Be(HealthStatus.Red);
    }

    [Fact]
    public void Prorates_current_week_denominator_to_elapsed_days()
    {
        var dailyLogs = new[]
        {
            new DailyLog(D("2026-04-13"), Energy: 4, SleepOk: true),
            new DailyLog(D("2026-04-14"), Energy: 3, SleepOk: true),
            new DailyLog(D("2026-04-15"), Energy: 5, SleepOk: true)
        };
        var workouts = new[]
        {
            new WorkoutLog(T("2026-04-13T07:00:00Z"), D("2026-04-13"), WorkoutType.Walk),
            new WorkoutLog(T("2026-04-14T07:00:00Z"), D("2026-04-14"), WorkoutType.Walk),
            new WorkoutLog(T("2026-04-15T07:00:00Z"), D("2026-04-15"), WorkoutType.Walk)
        };

        var result = AdherenceCalculations.CalculateWeeklyAdherence(
            D("2026-04-13"), dailyLogs, workouts, today: D("2026-04-15"));

        // completed = 3 energy + 3 sleep + 3 walks = 9; total = 3 + 3 + 7 = 13
        result.AdherencePercent.Should().Be((int)Math.Round(9d / 13d * 100d, MidpointRounding.AwayFromZero));
        result.Status.Should().Be(HealthStatus.Yellow);
    }

    [Fact]
    public void Uses_full_seven_day_denominator_when_today_is_outside_the_week()
    {
        var dailyLogs = new[]
        {
            new DailyLog(D("2026-04-13"), Energy: 4, SleepOk: true),
            new DailyLog(D("2026-04-14"), Energy: 4, SleepOk: true),
            new DailyLog(D("2026-04-15"), Energy: 3, SleepOk: false)
        };
        var workouts = new[]
        {
            new WorkoutLog(T("2026-04-13T07:00:00Z"), D("2026-04-13"), WorkoutType.Strength),
            new WorkoutLog(T("2026-04-15T07:00:00Z"), D("2026-04-15"), WorkoutType.Walk)
        };

        var result = AdherenceCalculations.CalculateWeeklyAdherence(
            D("2026-04-13"), dailyLogs, workouts, today: D("2026-05-01"));

        result.AdherencePercent.Should().Be(38);
    }

    [Fact]
    public void Caps_workout_completion_at_two_strength_and_five_walks()
    {
        var workouts = new[]
        {
            new WorkoutLog(T("2026-04-13T07:00:00Z"), D("2026-04-13"), WorkoutType.Strength),
            new WorkoutLog(T("2026-04-14T07:00:00Z"), D("2026-04-14"), WorkoutType.Strength),
            new WorkoutLog(T("2026-04-15T07:00:00Z"), D("2026-04-15"), WorkoutType.Strength),
            new WorkoutLog(T("2026-04-16T07:00:00Z"), D("2026-04-16"), WorkoutType.Walk)
        };

        var progress = AdherenceCalculations.CalculateWeeklyWorkoutProgress(D("2026-04-13"), workouts);

        progress.StrengthWorkouts.Should().Be(3);
        progress.Walks.Should().Be(1);
        progress.CompletedGoals.Should().Be(3); // capped strength (2) + raw walks (1)
        progress.RemainingStrengthWorkouts.Should().Be(0);
        progress.RemainingWalks.Should().Be(4);
    }
}
