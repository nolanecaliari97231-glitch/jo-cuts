import {
  SLOT_INTERVAL_MINUTES,
  combineDateAndTime,
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
  date: Date,
  windows: AvailabilityWindow[],
): string[] {
  const dayOfWeek = date.getDay();
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

export function filterAvailableSlots(
  date: Date,
  slotStarts: string[],
  durationMinutes: number,
  busyPeriods: BusyPeriod[],
): string[] {
  const now = new Date();

  return slotStarts.filter((slotStart) => {
    const start = combineDateAndTime(date, slotStart);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    if (start <= now) return false;

    return !busyPeriods.some((period) => rangesOverlap(start, end, period.start, period.end));
  });
}

export function isDateBookable(date: Date, windows: AvailabilityWindow[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + BOOKING_HORIZON_DAYS);

  if (date < today || date > maxDate) return false;

  const dayWindows = windows.filter((window) => window.dayOfWeek === date.getDay());
  return dayWindows.length > 0;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^(\+596|596|0)?\d{9}$/.test(normalized) || /^\d{10}$/.test(normalized);
}
