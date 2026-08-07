using HelseLoop.Domain;

namespace HelseLoop.Application.Abstractions;

/// <summary>
/// Backup import/export at the application boundary. Implementations MUST make
/// all-collection writes atomic (rollback on failure) and MUST NOT partially
/// import data.
/// </summary>
public interface IBackupStore
{
    Task<BackupSnapshot> ExportAsync(CancellationToken cancellationToken = default);

    Task ImportAsync(
        BackupSnapshot snapshot,
        BackupImportMode mode,
        CancellationToken cancellationToken = default);

    Task<StorageSummary> GetStorageSummaryAsync(CancellationToken cancellationToken = default);
}

/// <summary>In-memory snapshot representing backup v1 data.</summary>
public sealed record BackupSnapshot(
    DateTimeOffset ExportedAt,
    IReadOnlyList<DailyLog> DailyLogs,
    IReadOnlyList<WeeklyCheckIn> WeeklyCheckIns,
    IReadOnlyList<WorkoutLog> WorkoutLogs)
{
    public const int Version = 1;
}

public enum BackupImportMode
{
    Merge = 0,
    Overwrite = 1
}

public sealed record StorageSummary(int DailyLogs, int WeeklyCheckIns, int WorkoutLogs);
