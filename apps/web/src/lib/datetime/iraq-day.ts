/**
 * Iraq (Asia/Baghdad) calendar-day helpers — no heavy date library.
 */

const IRAQ_TZ = "Asia/Baghdad";

/** YYYY-MM-DD in Iraq timezone. */
export function getIraqCalendarDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IRAQ_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isSameIraqDay(
  isoTimestamp: string,
  relativeTo: Date = new Date(),
): boolean {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return false;
  return getIraqCalendarDayKey(parsed) === getIraqCalendarDayKey(relativeTo);
}

/** Compact time for admin lists, Iraq timezone. */
export function formatIraqDateTime(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-IQ", {
    timeZone: IRAQ_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}
