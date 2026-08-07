using HelseLoop.Domain;

namespace HelseLoop.Domain.Tests;

public class HealthStatusTests
{
    [Theory]
    [InlineData(80, HealthStatus.Green)]
    [InlineData(79, HealthStatus.Yellow)]
    [InlineData(50, HealthStatus.Yellow)]
    [InlineData(49, HealthStatus.Red)]
    [InlineData(0, HealthStatus.Red)]
    public void GetHealthStatus_maps_thresholds(int percent, HealthStatus expected)
    {
        WeeklyGoals.GetHealthStatus(percent).Should().Be(expected);
    }
}
