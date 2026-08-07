namespace HelseLoop.Application.Abstractions;

/// <summary>Preferred UI language.</summary>
public enum Locale
{
    Norwegian = 0,
    English = 1
}

/// <summary>Typed settings for scheduled reminders.</summary>
public sealed record ReminderSettings(
    bool EnergyReminderEnabled,
    bool StrengthMorningEnabled,
    int StrengthReminderHour)
{
    /// <summary>Default reminder hour matches the TypeScript app.</summary>
    public const int DefaultReminderHour = 7;

    public static ReminderSettings Default => new(
        EnergyReminderEnabled: false,
        StrengthMorningEnabled: false,
        StrengthReminderHour: DefaultReminderHour);
}

/// <summary>Persists the user's preferred locale (survives reloads).</summary>
public interface ILocalePreferenceStore
{
    Task<Locale?> GetAsync(CancellationToken cancellationToken = default);
    Task SetAsync(Locale locale, CancellationToken cancellationToken = default);
    Task ClearAsync(CancellationToken cancellationToken = default);
}

/// <summary>Persists reminder toggles and the scheduled hour (0-23).</summary>
public interface IReminderSettingsStore
{
    Task<ReminderSettings> GetAsync(CancellationToken cancellationToken = default);
    Task SaveAsync(ReminderSettings settings, CancellationToken cancellationToken = default);
}
