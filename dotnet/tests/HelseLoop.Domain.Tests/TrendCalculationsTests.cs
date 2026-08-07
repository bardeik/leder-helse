using System.Globalization;
using HelseLoop.Domain;

namespace HelseLoop.Domain.Tests;

public class TrendCalculationsTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);

    [Fact]
    public void Builds_weekly_trends_with_rounded_deltas_and_averages()
    {
        var weeks = WeekCalculations.GetRecentWeekStarts(D("2026-04-18"), 2);

        var dailyLogs = new[]
        {
            new DailyLog(weeks[0], Energy: 2, SleepOk: true),
            new DailyLog(weeks[1], Energy: 4, SleepOk: true),
            new DailyLog(weeks[1], Energy: 5, SleepOk: false)
        };
        var checkIns = new[]
        {
            new WeeklyCheckIn(weeks[0], WeightKg: 82.4),
            new WeeklyCheckIn(weeks[1], WeightKg: 81.9)
        };

        var points = TrendCalculations.BuildWeeklyTrends(weeks, dailyLogs, checkIns);

        points.Should().HaveCount(2);
        points[1].WeightDeltaKg.Should().Be(-0.5);
        points[1].EnergyAverage.Should().Be(4.5);
        points[1].SleepOkCount.Should().Be(1);
    }
}
