const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns whether a canonical YYYY-MM-DD string is a real Gregorian calendar date. */
export function isValidCalendarDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth =
    month === 2
      ? isLeapYear
        ? 29
        : 28
      : month === 4 || month === 6 || month === 9 || month === 11
        ? 30
        : 31;

  return day >= 1 && day <= daysInMonth;
}