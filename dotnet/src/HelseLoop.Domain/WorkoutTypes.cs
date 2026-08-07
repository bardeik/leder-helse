namespace HelseLoop.Domain;

/// <summary>
/// Canonical workout categorisation and legacy-value normalisation.
/// The TypeScript app persisted <c>strengthA</c>/<c>strengthB</c> in older
/// backups; both collapse to <see cref="WorkoutType.Strength"/> on read.
/// </summary>
public static class WorkoutTypes
{
    public static bool TryNormalize(string? value, out WorkoutType normalized)
    {
        switch (value)
        {
            case "strength":
            case "strengthA":
            case "strengthB":
                normalized = WorkoutType.Strength;
                return true;
            case "walk":
                normalized = WorkoutType.Walk;
                return true;
            default:
                normalized = default;
                return false;
        }
    }

    public static string ToJsonValue(WorkoutType type) => type switch
    {
        WorkoutType.Strength => "strength",
        WorkoutType.Walk => "walk",
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown workout type.")
    };
}
