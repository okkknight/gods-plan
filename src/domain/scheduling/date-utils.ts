import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

export function addBusinessDays(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function daysBetween(laterDate: string, earlierDate: string): number {
  return differenceInCalendarDays(parseISO(laterDate), parseISO(earlierDate));
}

export function getTodayInAppTimezone(now = new Date(), timezone = process.env.APP_TIMEZONE ?? "Asia/Shanghai"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isValidBusinessDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && format(parseISO(value), "yyyy-MM-dd") === value;
}
