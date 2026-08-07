using HelseLoop.Application.Abstractions;

namespace HelseLoop.Application.Tests;

/// <summary>Deterministic clock used across use-case tests.</summary>
internal sealed class FakeClock(DateTimeOffset now) : IClock
{
    public DateTimeOffset UtcNow { get; set; } = now;
    public DateOnly LocalToday => DateOnly.FromDateTime(UtcNow.LocalDateTime);
}
