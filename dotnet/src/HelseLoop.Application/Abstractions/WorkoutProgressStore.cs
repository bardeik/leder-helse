using HelseLoop.Domain.Workout;

namespace HelseLoop.Application.Abstractions;

/// <summary>
/// Persistence for the workout session snapshot (matches the current
/// <c>workoutProgress</c> key in browser localStorage).
/// </summary>
public interface IWorkoutProgressStore
{
    Task<WorkoutSessionState?> LoadAsync(CancellationToken cancellationToken = default);
    Task SaveAsync(WorkoutSessionState state, CancellationToken cancellationToken = default);
    Task ClearAsync(CancellationToken cancellationToken = default);
}
