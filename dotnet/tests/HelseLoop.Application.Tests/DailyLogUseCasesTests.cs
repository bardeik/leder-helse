using System.Globalization;
using HelseLoop.Application.Abstractions;
using HelseLoop.Application.UseCases;
using HelseLoop.Domain;

namespace HelseLoop.Application.Tests;

public class DailyLogUseCasesTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);

    [Fact]
    public async Task Load_returns_default_state_when_repository_is_empty()
    {
        var repo = Substitute.For<IDailyLogRepository>();
        repo.GetAsync(D("2026-04-15"), Arg.Any<CancellationToken>()).Returns((DailyLog?)null);

        var sut = new DailyLogUseCases(repo, new FakeClock(new DateTimeOffset(2026, 4, 15, 8, 0, 0, TimeSpan.Zero)));

        var state = await sut.LoadAsync(D("2026-04-15"));

        state.Should().Be(DailyLogState.CreateDefault(D("2026-04-15")));
        await repo.DidNotReceive().UpsertAsync(Arg.Any<DailyLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Save_trims_notes_and_persists_normalised_log()
    {
        var repo = Substitute.For<IDailyLogRepository>();
        DailyLog? captured = null;
        await repo.UpsertAsync(Arg.Do<DailyLog>(l => captured = l), Arg.Any<CancellationToken>());

        var sut = new DailyLogUseCases(repo, new FakeClock(DateTimeOffset.UtcNow));

        var outcome = await sut.SaveAsync(new DailyLogState(
            D("2026-04-15"),
            Energy: 4,
            SleepOk: true,
            SleepHours: 7.5,
            Notes: "  Sleepy  "));

        outcome.Should().Be(SaveOutcome.Ok);
        captured.Should().NotBeNull();
        captured!.Notes.Should().Be("Sleepy");
        captured.SleepHours.Should().Be(7.5);
    }

    [Theory]
    [InlineData(0, "energy_out_of_range")]
    [InlineData(6, "energy_out_of_range")]
    public async Task Save_returns_typed_error_for_out_of_range_energy(int energy, string expectedCode)
    {
        var repo = Substitute.For<IDailyLogRepository>();
        var sut = new DailyLogUseCases(repo, new FakeClock(DateTimeOffset.UtcNow));

        var outcome = await sut.SaveAsync(new DailyLogState(
            D("2026-04-15"), energy, SleepOk: true, SleepHours: null, Notes: null));

        outcome.Success.Should().BeFalse();
        outcome.ErrorCode.Should().Be(expectedCode);
        await repo.DidNotReceive().UpsertAsync(Arg.Any<DailyLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public void Navigation_bounds_are_today_plus_previous_thirteen_days()
    {
        var clock = new FakeClock(new DateTimeOffset(2026, 4, 15, 8, 0, 0, TimeSpan.Zero));
        var sut = new DailyLogUseCases(Substitute.For<IDailyLogRepository>(), clock);

        sut.Today.Should().Be(D("2026-04-15"));
        sut.MinDate.Should().Be(D("2026-04-02"));
        sut.CanGoBack(D("2026-04-15")).Should().BeTrue();
        sut.CanGoBack(D("2026-04-02")).Should().BeFalse();
        sut.CanGoForward(D("2026-04-15")).Should().BeFalse();
        sut.CanGoForward(D("2026-04-14")).Should().BeTrue();
    }
}
