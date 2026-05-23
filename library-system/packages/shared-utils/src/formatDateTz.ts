/**
 * Format a Date object into a human-readable string in a given timezone.
 *
 * @param date - The date to format.
 * @param timeZone - IANA timezone string (e.g. "Asia/Manila"). Defaults to local timezone.
 * @param locale - BCP 47 locale string (default: "en-US").
 * @returns A formatted date string like "Jan 15, 2025, 3:30 PM".
 */
export function formatDateTz(
  date: Date,
  timeZone?: string,
  locale: string = "en-US",
): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}
