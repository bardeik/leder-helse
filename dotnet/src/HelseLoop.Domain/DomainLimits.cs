namespace HelseLoop.Domain;

/// <summary>Product-wide payload guardrails for backup import/export.</summary>
public static class BackupLimits
{
    public const int MaxBackupJsonBytes = 5 * 1024 * 1024;
    public const int MaxItemsPerTable = 10_000;
    public const string MaxBackupSizeLabel = "5 MB";
}

/// <summary>Text length limits shared with the TypeScript app.</summary>
public static class TextLimits
{
    public const int NotesMaxLength = 1000;
    public const int AdjustmentMaxLength = 280;
}

/// <summary>Value ranges for validation of user-entered health data.</summary>
public static class ValueRanges
{
    public const int EnergyMin = 1;
    public const int EnergyMax = 5;
    public const double WeightKgMax = 400;
    public const double SleepHoursMax = 24;
    public const int WorkoutDurationMinutesMax = 300;
}
