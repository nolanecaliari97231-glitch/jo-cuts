import {
  SLOT_INTERVAL_MINUTES,
  combineDateAndTime,
  getSalonDayOfWeek,
  getSalonTodayKey,
  addDaysToDateKey,
  timeToMinutes,
  type AvailabilityWindow,
} from "@/lib/schedule";

export const BOOKING_HORIZON_DAYS = 60;

export type BusyPeriod = {
  start: Date;
  end: Date;
};

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

export function generateSlotStartsForDay(
  dateKey: string,
  windows: AvailabilityWindow[],
): string[] {
  const dayOfWeek = getSalonDayOfWeek(dateKey);
  const dayWindows = windows.filter((window) => window.dayOfWeek === dayOfWeek);
  const slots = new Set<string>();

  for (const window of dayWindows) {
    let cursor = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);

    while (cursor < windowEnd) {
      slots.add(minutesToTimeString(cursor));
      cursor += SLOT_INTERVAL_MINUTES;
    }
  }

  return [...slots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function slotFitsInWindows(
  dateKey: string,
  slotStart: string,
  durationMinutes: number,
  windows: AvailabilityWindow[],
): boolean {
  const dayOfWeek = getSalonDayOfWeek(dateKey);
  const dayWindows = windows.filter((window) => window.dayOfWeek === dayOfWeek);
  const startMin = timeToMinutes(slotStart);
  const endMin = startMin + durationMinutes;

  return dayWindows.some((window) => {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    return startMin >= windowStart && endMin <= windowEnd;
  });
}

export function filterAvailableSlots(
  dateKey: string,
  slotStarts: string[],
  durationMinutes: number,
  busyPeriods: BusyPeriod[],
  windows?: AvailabilityWindow[],
): string[] {
  const now = new Date();

  return slotStarts.filter((slotStart) => {
    if (windows && !slotFitsInWindows(dateKey, slotStart, durationMinutes, windows)) {
      return false;
    }

    const start = combineDateAndTime(dateKey, slotStart);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    if (start <= now) return false;

    return !busyPeriods.some((period) => rangesOverlap(start, end, period.start, period.end));
  });
}

export function isDateBookable(dateKey: string, windows: AvailabilityWindow[]): boolean {
  const todayKey = getSalonTodayKey();
  const maxKey = addDaysToDateKey(todayKey, BOOKING_HORIZON_DAYS);

  if (dateKey < todayKey || dateKey > maxKey) return false;

  const dayOfWeek = getSalonDayOfWeek(dateKey);
  return windows.some((window) => window.dayOfWeek === dayOfWeek);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^(\+596|596|0)?\d{9}$/.test(normalized) || /^\d{10}$/.test(normalized);
}
