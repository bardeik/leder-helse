namespace HelseLoop.Domain;

/// <summary>
/// Workout categories persisted by Helse Loop. Legacy TypeScript values
/// <c>strengthA</c> and <c>strengthB</c> are normalized to <see cref="Strength"/>
/// at the persistence/import boundary; the domain only recognizes the two
/// canonical values below.
/// </summary>
public enum WorkoutType
{
    Strength = 0,
    Walk = 1
}

/// <summary>Weekly adherence classification (green/yellow/red).</summary>
public enum HealthStatus
{
    Red = 0,
    Yellow = 1,
    Green = 2
}
