import type { OpeningHour } from "@/lib/salon";

/** 0 = dimanche … 6 = samedi (convention JavaScript). */
export const WEEKDAYS = [
  { dayOfWeek: 1, label: "Lundi" },
  { dayOfWeek: 2, label: "Mardi" },
  { dayOfWeek: 3, label: "Mercredi" },
  { dayOfWeek: 4, label: "Jeudi" },
  { dayOfWeek: 5, label: "Vendredi" },
  { dayOfWeek: 6, label: "Samedi" },
  { dayOfWeek: 0, label: "Dimanche" },
] as const;

export const SLOT_INTERVAL_MINUTES = 30;

export const APPOINTMENT_STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
} as const;

export const APPOINTMENT_STATUS_COLORS = {
  pending: "border-amber-500/40 bg-amber-500/15 text-amber-100",
  confirmed: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  refused: "border-red-500/40 bg-red-500/15 text-red-100",
  cancelled: "border-white/20 bg-white/5 text-[var(--color-muted)]",
  completed: "border-sky-500/40 bg-sky-500/15 text-sky-100",
} as const;

export type DaySchedule = {
  dayOfWeek: number;
  label: string;
  closed: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

export type AvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

/** Horaires par défaut alignés sur salon.ts (pause 12h–12h30, samedi fermé). */
export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = WEEKDAYS.map(({ dayOfWeek, label }) => ({
  dayOfWeek,
  label,
  closed: dayOfWeek === 6,
  morningStart: "07:00",
  morningEnd: "12:00",
  afternoonStart: "12:30",
  afternoonEnd: "17:00",
}));

export function getWeekdayLabel(dayOfWeek: number): string {
  return WEEKDAYS.find((day) => day.dayOfWeek === dayOfWeek)?.label ?? "Jour";
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeDisplay(startTime)} – ${formatTimeDisplay(endTime)}`;
}

export function dayScheduleToWindows(schedule: DaySchedule): AvailabilityWindow[] {
  if (schedule.closed) return [];

  return [
    {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.morningStart,
      endTime: schedule.morningEnd,
    },
    {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.afternoonStart,
      endTime: schedule.afternoonEnd,
    },
  ];
}

export function windowsToDaySchedule(
  dayOfWeek: number,
  windows: { startTime: string; endTime: string }[],
): DaySchedule {
  const label = getWeekdayLabel(dayOfWeek);
  if (windows.length === 0) {
    return {
      dayOfWeek,
      label,
      closed: true,
      morningStart: "07:00",
      morningEnd: "12:00",
      afternoonStart: "12:30",
      afternoonEnd: "17:00",
    };
  }

  const sorted = [...windows].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  return {
    dayOfWeek,
    label,
    closed: false,
    morningStart: sorted[0]?.startTime ?? "07:00",
    morningEnd: sorted[0]?.endTime ?? "12:00",
    afternoonStart: sorted[1]?.startTime ?? sorted[0]?.startTime ?? "12:30",
    afternoonEnd: sorted[1]?.endTime ?? sorted[0]?.endTime ?? "17:00",
  };
}

export function schedulesToOpeningHours(schedules: DaySchedule[]): OpeningHour[] {
  return schedules.map((schedule) => {
    if (schedule.closed) {
      return { day: schedule.label, hours: "Fermé", closed: true };
    }

    const morning = formatTimeRange(schedule.morningStart, schedule.morningEnd);
    const afternoon = formatTimeRange(schedule.afternoonStart, schedule.afternoonEnd);

    return {
      day: schedule.label,
      hours: `${morning} · ${afternoon}`,
    };
  });
}

export function parseDateParam(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  return startOfDay(new Date());
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

/** Lundi de la semaine contenant `date`. */
export function getWeekStart(date: Date): Date {
  const current = startOfDay(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthGrid(monthStart: Date): Date[] {
  const firstDay = getMonthStart(monthStart);
  const gridStart = getWeekStart(firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export const CALENDAR_HOURS = Array.from({ length: 11 }, (_, index) => 7 + index);
