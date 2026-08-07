namespace HelseLoop.Domain;

/// <summary>
/// Six-week weight/energy/sleep trend construction and the pure part of the
/// dashboard "next action" projection. Presentation-free.
/// </summary>
public static class TrendCalculations
{
    /// <summary>
    /// Builds one <see cref="WeeklyTrendPoint"/> per week start in
    /// <paramref name="weekStartDates"/> (oldest first). Weight delta is against
    /// the immediately preceding week when both values exist.
    /// </summary>
    public static IReadOnlyList<WeeklyTrendPoint> BuildWeeklyTrends(
        IReadOnlyList<DateOnly> weekStartDates,
        IEnumerable<DailyLog> dailyLogs,
        IEnumerable<WeeklyCheckIn> weeklyCheckIns)
    {
        ArgumentNullException.ThrowIfNull(weekStartDates);
        ArgumentNullException.ThrowIfNull(dailyLogs);
        ArgumentNullException.ThrowIfNull(weeklyCheckIns);

        var dailyList = dailyLogs as IReadOnlyCollection<DailyLog> ?? [.. dailyLogs];
        var weightByWeek = new Dictionary<DateOnly, double>();
        foreach (var checkIn in weeklyCheckIns)
        {
            weightByWeek[checkIn.WeekStartDate] = checkIn.WeightKg;
        }

        var points = new WeeklyTrendPoint[weekStartDates.Count];
        for (var index = 0; index < weekStartDates.Count; index++)
        {
            var weekStart = weekStartDates[index];
            var weekEnd = weekStart.AddDays(6);

            var energySum = 0;
            var energyCount = 0;
            var sleepOkCount = 0;

            foreach (var log in dailyList)
            {
                if (log.Date < weekStart || log.Date > weekEnd)
                {
                    continue;
                }
                energySum += log.Energy;
                energyCount++;
                if (log.SleepOk)
                {
                    sleepOkCount++;
                }
            }

            double? energyAverage = energyCount > 0
                ? RoundHalfAwayFromZero(energySum / (double)energyCount, 1)
                : null;

            double? currentWeight = weightByWeek.TryGetValue(weekStart, out var w) ? w : null;
            double? previousWeight = null;
            if (index > 0 && weightByWeek.TryGetValue(weekStartDates[index - 1], out var prev))
            {
                previousWeight = prev;
            }

            double? weightDelta = currentWeight is { } cw && previousWeight is { } pw
                ? RoundHalfAwayFromZero(cw - pw, 1)
                : null;

            points[index] = new WeeklyTrendPoint(
                WeekStartDate: weekStart,
                SleepOkCount: sleepOkCount,
                WeightKg: currentWeight,
                WeightDeltaKg: weightDelta,
                EnergyAverage: energyAverage);
        }

        return points;
    }

    private static double RoundHalfAwayFromZero(double value, int decimals)
        => Math.Round(value, decimals, MidpointRounding.AwayFromZero);
}
