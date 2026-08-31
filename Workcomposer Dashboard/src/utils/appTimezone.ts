import { fromZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getAppTimezone(
  reportTimezone?: string | null
): string {
  if (
    reportTimezone &&
    reportTimezone !== "Browser timezone"
  ) {
    return reportTimezone;
  }

  return getBrowserTimezone() || DEFAULT_TIMEZONE;
}

export function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  timezone: string
): Date {
  const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T00:00:00`;

  return fromZonedTime(dateString, timezone);
}

export function formatDateForApi(
  date: Date,
  timezone: string
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTodayInTimezone(
  timezone: string
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Get the year/month(0-indexed)/day of a Date, as seen in a given timezone.
 */
export function getDatePartsInTimezone(
  date: Date,
  timezone: string
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value) - 1,
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

/**
 * Get the hour(0-23)/minute of a Date, as seen in a given timezone.
 */
export function getTimePartsInTimezone(
  date: Date,
  timezone: string
): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    hour: Number(parts.find((p) => p.type === "hour")?.value) % 24,
    minute: Number(parts.find((p) => p.type === "minute")?.value),
  };
}

/**
 * Format just the time portion (e.g. "02:45 PM") of a Date in a given timezone.
 */
export function formatTimeInTimezone(
  date: Date,
  timezone: string
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Build a real Date from wall-clock year/month/day/hour/minute values,
 * interpreting them as being in `timezone` (not the browser's local timezone).
 */
export function createDateTimeInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}:00`;

  return fromZonedTime(dateString, timezone);
}

/**
 * Add (or subtract) whole calendar days to a Date, where "calendar day"
 * is determined by the given timezone (avoids DST / UTC-shift off-by-one bugs).
 */
export function addDaysInTimezone(
  date: Date,
  days: number,
  timezone: string
): Date {
  const { year, month, day } = getDatePartsInTimezone(date, timezone);

  const utcDate = new Date(Date.UTC(year, month, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);

  return createDateInTimezone(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    timezone
  );
}

/**
 * True if two Dates fall on the same calendar day in the given timezone.
 */
export function isSameDayInTimezone(
  a: Date,
  b: Date,
  timezone: string
): boolean {
  const partsA = getDatePartsInTimezone(a, timezone);
  const partsB = getDatePartsInTimezone(b, timezone);

  return (
    partsA.year === partsB.year &&
    partsA.month === partsB.month &&
    partsA.day === partsB.day
  );
}