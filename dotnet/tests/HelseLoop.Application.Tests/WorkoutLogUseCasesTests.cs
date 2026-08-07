using System.Globalization;
using HelseLoop.Application.Abstractions;
using HelseLoop.Application.UseCases;
using HelseLoop.Domain;

namespace HelseLoop.Application.Tests;

public class WorkoutLogUseCasesTests
{
    private static DateOnly D(string iso) => DateOnly.Parse(iso, CultureInfo.InvariantCulture);

    [Fact]
    public async Task Adds_workout_for_today_using_the_clock_instant()
    {
        var repo = Substitute.For<IWorkoutLogRepository>();
        WorkoutLog? captured = null;
        repo.UpsertAsync(Arg.Do<WorkoutLog>(l => captured = l), Arg.Any<CancellationToken>()).Returns(42);

        var now = new DateTimeOffset(2026, 4, 15, 8, 30, 0, TimeSpan.Zero);
        var sut = new WorkoutLogUseCases(repo, new FakeClock(now));

        var log = await sut.AddQuickAsync(D("2026-04-15"), WorkoutType.Walk, durationMinutes: 20);

        log.Id.Should().Be(42);
        captured!.DateTime.Should().Be(now);
        captured.DurationMinutes.Should().Be(20);
    }

    [Fact]
    public async Task Adds_workout_for_past_date_using_noon_utc_for_stable_ordering()
    {
        var repo = Substitute.For<IWorkoutLogRepository>();
        WorkoutLog? captured = null;
        repo.UpsertAsync(Arg.Do<WorkoutLog>(l => captured = l), Arg.Any<CancellationToken>()).Returns(7);

        var sut = new WorkoutLogUseCases(repo, new FakeClock(new DateTimeOffset(2026, 4, 15, 8, 30, 0, TimeSpan.Zero)));

        await sut.AddQuickAsync(D("2026-04-10"), WorkoutType.Strength);

        captured!.DateTime.Should().Be(new DateTimeOffset(2026, 4, 10, 12, 0, 0, TimeSpan.Zero));
    }

    [Fact]
    public async Task Rejects_invalid_duration()
    {
        var repo = Substitute.For<IWorkoutLogRepository>();
        var sut = new WorkoutLogUseCases(repo, new FakeClock(DateTimeOffset.UtcNow));

        var attempt = () => sut.AddQuickAsync(D("2026-04-15"), WorkoutType.Walk, durationMinutes: 999);

        await attempt.Should().ThrowAsync<ArgumentOutOfRangeException>();
    }
}
