using HelseLoop.Domain;

namespace HelseLoop.Domain.Tests;

public class WorkoutTypesTests
{
    [Theory]
    [InlineData("strength", WorkoutType.Strength)]
    [InlineData("strengthA", WorkoutType.Strength)] // legacy backup value
    [InlineData("strengthB", WorkoutType.Strength)] // legacy backup value
    [InlineData("walk", WorkoutType.Walk)]
    public void Normalises_known_workout_type_strings(string input, WorkoutType expected)
    {
        WorkoutTypes.TryNormalize(input, out var actual).Should().BeTrue();
        actual.Should().Be(expected);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("run")]
    public void Returns_false_for_unknown_workout_type_strings(string? input)
    {
        WorkoutTypes.TryNormalize(input, out _).Should().BeFalse();
    }
}
