using System.Globalization;
using HelseLoop.Domain;

namespace HelseLoop.Domain.Tests;

public class WeekCalculationsTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);

    [Theory]
    [InlineData("2026-04-13", "2026-04-13")] // Monday -> Monday
    [InlineData("2026-04-14", "2026-04-13")] // Tuesday -> Monday
    [InlineData("2026-04-19", "2026-04-13")] // Sunday  -> Monday (matches TS fixture)
    [InlineData("2025-12-30", "2025-12-29")] // year boundary
    [InlineData("2024-02-29", "2024-02-26")] // leap day
    public void GetWeekStartDate_returns_monday(string input, string expected)
    {
        var actual = WeekCalculations.GetWeekStartDate(D(input));

        actual.Should().Be(D(expected));
    }

    [Fact]
    public void GetRecentWeekStarts_returns_six_mondays_ordered_oldest_first()
    {
        var result = WeekCalculations.GetRecentWeekStarts(D("2026-04-18"), 6);

        result.Should().HaveCount(6);
        result[^1].Should().Be(D("2026-04-13"));
        for (var i = 1; i < result.Count; i++)
        {
            (result[i].DayNumber - result[i - 1].DayNumber).Should().Be(7);
        }
    }
}
