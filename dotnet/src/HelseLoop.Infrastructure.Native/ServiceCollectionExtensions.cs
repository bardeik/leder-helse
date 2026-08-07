using HelseLoop.Application.Abstractions;
using HelseLoop.Application.UseCases;
using HelseLoop.Infrastructure.Browser;
using Microsoft.Extensions.DependencyInjection;

namespace HelseLoop.Infrastructure.Native;

/// <summary>
/// DI wiring for the MAUI native host. Currently delegates to the same
/// in-memory repository stubs used by the Web host so the composition roots
/// stay identical while the SQLite adapter (plan issue B4) is implemented.
/// </summary>
public static class NativeInfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddHelseLoopNativeInfrastructure(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddSingleton<IClock, SystemClock>();

        services.AddSingleton<IDailyLogRepository, InMemoryDailyLogRepository>();
        services.AddSingleton<IWeeklyCheckInRepository, InMemoryWeeklyCheckInRepository>();
        services.AddSingleton<IWorkoutLogRepository, InMemoryWorkoutLogRepository>();

        services.AddScoped<DailyLogUseCases>();
        services.AddScoped<WeeklyCheckInUseCases>();
        services.AddScoped<DashboardUseCases>();
        services.AddScoped<WorkoutLogUseCases>();

        return services;
    }
}
