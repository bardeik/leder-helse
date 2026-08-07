namespace HelseLoop.Domain;

/// <summary>
/// Weekly goals and adherence thresholds. Values match the TypeScript
/// <c>WEEKLY_STRENGTH_GOAL</c>/<c>WEEKLY_WALK_GOAL</c> constants exactly.
/// </summary>
public static class WeeklyGoals
{
    public const int WeeklyStrengthGoal = 2;
    public const int WeeklyWalkGoal = 5;
    public const int WeeklyWorkoutGoal = WeeklyStrengthGoal + WeeklyWalkGoal;

    public const int GreenThresholdPercent = 80;
    public const int YellowThresholdPercent = 50;

    public static HealthStatus GetHealthStatus(int adherencePercent) => adherencePercent switch
    {
        >= GreenThresholdPercent => HealthStatus.Green,
        >= YellowThresholdPercent => HealthStatus.Yellow,
        _ => HealthStatus.Red
    };
}

/// <summary>
/// Monday-based week arithmetic. Uses <see cref="DateOnly"/> so callers never
/// need to reason about UTC/local time.
/// </summary>
public static class WeekCalculations
{
    /// <summary>
    /// Returns the Monday on or before <paramref name="date"/>.
    /// Matches the TypeScript <c>getWeekStartDate</c> using UTC arithmetic:
    /// Sunday shifts back 6 days; other weekdays shift back to Monday.
    /// </summary>
    public static DateOnly GetWeekStartDate(DateOnly date)
    {
        var offsetToMonday = date.DayOfWeek == DayOfWeek.Sunday
            ? -6
            : (int)DayOfWeek.Monday - (int)date.DayOfWeek;
        return date.AddDays(offsetToMonday);
    }

    /// <summary>Adds <paramref name="days"/> to <paramref name="date"/>.</summary>
    public static DateOnly AddDays(DateOnly date, int days) => date.AddDays(days);

    /// <summary>
    /// Returns the Monday start dates for the last <paramref name="count"/> weeks
    /// ending in the week containing <paramref name="fromDate"/>. Oldest first.
    /// </summary>
    public static IReadOnlyList<DateOnly> GetRecentWeekStarts(DateOnly fromDate, int count = 6)
    {
        if (count <= 0)
        {
            return [];
        }

        var currentWeekStart = GetWeekStartDate(fromDate);
        var result = new DateOnly[count];
        for (var i = 0; i < count; i++)
        {
            result[i] = currentWeekStart.AddDays((i - (count - 1)) * 7);
        }
        return result;
    }
}
