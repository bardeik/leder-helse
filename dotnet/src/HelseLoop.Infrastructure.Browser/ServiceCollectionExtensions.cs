using HelseLoop.Application.Abstractions;
using HelseLoop.Application.UseCases;
using Microsoft.Extensions.DependencyInjection;

namespace HelseLoop.Infrastructure.Browser;

/// <summary>
/// DI wiring for the browser host. Registers Application use cases and the
/// current in-memory repository/settings stubs. The stubs will be replaced by
/// an IndexedDB-backed JS interop adapter (plan issue B3) without touching the
/// Application or Shared UI layers.
/// </summary>
public static class BrowserInfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddHelseLoopBrowserInfrastructure(this IServiceCollection services)
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
