namespace HelseLoop.Domain;

/// <summary>Locale-tolerant number parsing (accepts <c>.</c> and <c>,</c>).</summary>
public static class LocaleNumber
{
    /// <summary>
    /// Parses a numeric string that may use either <c>.</c> or <c>,</c> as the
    /// decimal separator. Returns <c>0</c> for empty input to match the
    /// TypeScript app.
    /// </summary>
    public static double Parse(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return 0;
        }

        var normalized = value.Replace(',', '.');
        return double.TryParse(
            normalized,
            System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture,
            out var parsed)
            ? parsed
            : 0;
    }

    /// <summary>
    /// Formats <paramref name="value"/> using the ambient UI culture with a fixed
    /// number of fraction digits. Returns an empty string when the value is null.
    /// </summary>
    public static string Format(double? value, int fractionDigits = 1)
    {
        if (value is null)
        {
            return string.Empty;
        }

        var format = "N" + fractionDigits.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return value.Value.ToString(format, System.Globalization.CultureInfo.CurrentCulture);
    }
}
