using System.Globalization;
using HelseLoop.Application.Abstractions;
using HelseLoop.Application.UseCases;
using HelseLoop.Domain;

namespace HelseLoop.Application.Tests;

public class WeeklyCheckInUseCasesTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);

    [Theory]
    [InlineData(82.0, 81.0, 82.0)] // current wins
    [InlineData(null, 81.5, 81.5)] // previous fallback
    [InlineData(null, null, WeeklyCheckInUseCases.DefaultWeightKg)]
    public void ResolveInitialWeight_prefers_current_then_previous_then_default(
        double? current, double? previous, double expected)
    {
        WeeklyCheckInUseCases.ResolveInitialWeight(current, previous).Should().Be(expected);
    }

    [Fact]
    public void Navigation_bounds_are_current_plus_two_prior_mondays()
    {
        // 2026-04-15 (Wednesday) -> current Monday 2026-04-13, min = 2026-03-30
        var clock = new FakeClock(new DateTimeOffset(2026, 4, 15, 8, 0, 0, TimeSpan.Zero));
        var sut = new WeeklyCheckInUseCases(Substitute.For<IWeeklyCheckInRepository>(), clock);

        sut.MaxWeekStart.Should().Be(D("2026-04-13"));
        sut.MinWeekStart.Should().Be(D("2026-03-30"));
        sut.CanGoBack(D("2026-04-13")).Should().BeTrue();
        sut.CanGoBack(D("2026-03-30")).Should().BeFalse();
        sut.CanGoForward(D("2026-04-13")).Should().BeFalse();
        sut.CanGoForward(D("2026-04-06")).Should().BeTrue();
    }

    [Fact]
    public async Task Load_falls_back_to_previous_weight_when_current_week_missing()
    {
        var repo = Substitute.For<IWeeklyCheckInRepository>();
        repo.GetAsync(D("2026-04-13"), Arg.Any<CancellationToken>()).Returns((WeeklyCheckIn?)null);
        repo.GetAsync(D("2026-04-06"), Arg.Any<CancellationToken>()).Returns(new WeeklyCheckIn(D("2026-04-06"), 82.4));

        var sut = new WeeklyCheckInUseCases(repo, new FakeClock(new DateTimeOffset(2026, 4, 15, 8, 0, 0, TimeSpan.Zero)));

        var state = await sut.LoadAsync(D("2026-04-13"));

        state.WeightKg.Should().Be(82.4);
        state.Notes.Should().BeEmpty();
    }

    [Fact]
    public async Task Save_rejects_notes_that_exceed_the_length_limit()
    {
        var repo = Substitute.For<IWeeklyCheckInRepository>();
        var sut = new WeeklyCheckInUseCases(repo, new FakeClock(DateTimeOffset.UtcNow));

        var outcome = await sut.SaveAsync(new WeeklyCheckInState(
            D("2026-04-13"),
            WeightKg: 82.0,
            Notes: new string('x', TextLimits.NotesMaxLength + 1),
            Adjustment: string.Empty));

        outcome.Success.Should().BeFalse();
        outcome.ErrorCode.Should().Be("notes_too_long");
        await repo.DidNotReceive().UpsertAsync(Arg.Any<WeeklyCheckIn>(), Arg.Any<CancellationToken>());
    }
}
