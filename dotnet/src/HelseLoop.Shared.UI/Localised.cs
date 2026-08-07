namespace HelseLoop.SharedUI;

/// <summary>
/// Temporary in-project resource shim so Shared UI components can compile
/// today. Replaced by a typed <c>Microsoft.Extensions.Localization</c> facade
/// backed by <c>.resx</c> once the localisation issue lands.
/// </summary>
internal static class Localised
{
    public const string NavHome = "Hjem";
    public const string NavLog = "Logg i dag";
    public const string NavCheckIn = "Ukentlig innsjekk";
    public const string NavWorkout = "Trening";
    public const string NavSettings = "Innstillinger";

    public const string LogAutoSaveHint = "Endringer lagres automatisk.";
    public const string LogEnergyLabel = "Hvordan er energien i dag?";
    public const string LogSleepOkLabel = "Sov du bra?";
    public const string LogSleepHoursLabel = "Antall timer søvn (valgfritt)";
    public const string LogNotesLabel = "Notat";
    public const string LogAddWalk = "Legg til gåtur";
    public const string LogAddStrength = "Legg til styrkeøkt";
    public const string SaveConfirm = "Endringer lagret";
}
