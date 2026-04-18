/**
 * Parse a localized number string to a JavaScript number.
 * Handles both . and , as decimal separators regardless of user locale.
 */
export function parseLocalNumber(value: string): number {
  if (!value) return 0;

  // Normalize both . and , to . for parsing
  // This allows users to type either separator regardless of their locale
  const normalized = value.replace(/[,.]/g, ".");

  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number according to the user's locale.
 * Uses the locale decimal separator (e.g., , in de-DE, . in en-US).
 */
export function formatLocalNumber(value: number | undefined, fractionDigits: number = 1): string {
  if (value === undefined || value === null) return "";

  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}

/**
 * Get the locale's decimal separator.
 */
export function getDecimalSeparator(): string {
  const formatter = new Intl.NumberFormat(undefined);
  const parts = formatter.formatToParts(1.5);
  return parts.find((p) => p.type === "decimal")?.value ?? ".";
}
