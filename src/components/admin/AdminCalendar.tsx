import Link from "next/link";
import type { DbBlockedSlot, DbCalendarAppointment } from "@/lib/availability-data";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  CALENDAR_HOURS,
  addDays,
  formatDateKey,
  formatLongDate,
  formatShortDate,
  getMonthGrid,
  getMonthStart,
  getWeekDays,
  getWeekStart,
  type DaySchedule,
} from "@/lib/schedule";

const HOUR_HEIGHT = 56;

type CalendarView = "day" | "week" | "month";

function buildCalendarUrl(view: CalendarView, date: Date): string {
  return `/admin/calendar?view=${view}&date=${formatDateKey(date)}`;
}

function getViewRange(view: CalendarView, date: Date): { start: Date; end: Date } {
  if (view === "day") {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = addDays(start, 1);
    return { start, end };
  }

  if (view === "week") {
    const start = getWeekStart(date);
    const end = addDays(start, 7);
    return { start, end };
  }

  const monthStart = getMonthStart(date);
  const grid = getMonthGrid(monthStart);
  const start = grid[0]!;
  const end = addDays(grid[grid.length - 1]!, 1);
  return { start, end };
}

function getTopOffset(dateTime: Date): number {
  const minutesFromStart = dateTime.getHours() * 60 + dateTime.getMinutes() - CALENDAR_HOURS[0]! * 60;
  return (minutesFromStart / 60) * HOUR_HEIGHT;
}

function getBlockHeight(startTime: Date, endTime: Date): number {
  const minutes = (endTime.getTime() - startTime.getTime()) / 60_000;
  return Math.max((minutes / 60) * HOUR_HEIGHT, 24);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CalendarNav({ view, date }: { view: CalendarView; date: Date }) {
  const shift = view === "month" ? 0 : view === "week" ? 7 : 1;
  const prevDate =
    view === "month"
      ? new Date(date.getFullYear(), date.getMonth() - 1, 1)
      : addDays(date, -shift);
  const nextDate =
    view === "month"
      ? new Date(date.getFullYear(), date.getMonth() + 1, 1)
      : addDays(date, shift);

  const title =
    view === "day"
      ? formatLongDate(date)
      : view === "week"
        ? `Semaine du ${formatShortDate(getWeekStart(date))}`
        : date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link
          href={buildCalendarUrl(view, prevDate)}
          className="rounded-sm border border-white/20 px-3 py-1.5 text-sm hover:border-white/40"
        >
          ←
        </Link>
        <Link
          href={buildCalendarUrl(view, nextDate)}
          className="rounded-sm border border-white/20 px-3 py-1.5 text-sm hover:border-white/40"
        >
          →
        </Link>
        <Link
          href={buildCalendarUrl(view, new Date())}
          className="rounded-sm border border-white/20 px-3 py-1.5 text-sm hover:border-white/40"
        >
          Aujourd&apos;hui
        </Link>
      </div>

      <h2 className="font-serif text-xl capitalize">{title}</h2>

      <div className="flex gap-2">
        {(["day", "week", "month"] as const).map((item) => (
          <Link
            key={item}
            href={buildCalendarUrl(item, date)}
            className={`rounded-sm px-3 py-1.5 text-sm capitalize ${
              view === item
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "border border-white/20 hover:border-white/40"
            }`}
          >
            {item === "day" ? "Jour" : item === "week" ? "Semaine" : "Mois"}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="mt-8 flex flex-wrap gap-3 text-xs">
      {Object.entries(APPOINTMENT_STATUS_LABELS).map(([status, label]) => (
        <span
          key={status}
          className={`rounded-sm border px-2 py-1 ${APPOINTMENT_STATUS_COLORS[status as keyof typeof APPOINTMENT_STATUS_COLORS]}`}
        >
          {label}
        </span>
      ))}
      <span className="rounded-sm border border-white/20 bg-white/5 px-2 py-1 text-[var(--color-muted)]">
        Indisponible
      </span>
    </div>
  );
}

function AppointmentBlock({ appointment }: { appointment: DbCalendarAppointment }) {
  return (
    <Link
      href={`/admin/appointments/${appointment.id}`}
      className={`absolute inset-x-1 block overflow-hidden rounded-sm border px-2 py-1 text-xs transition-opacity hover:opacity-90 ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
      style={{
        top: getTopOffset(appointment.startTime),
        height: getBlockHeight(appointment.startTime, appointment.endTime),
      }}
    >
      <p className="font-medium">{appointment.client.name}</p>
      <p className="opacity-80">{appointment.service.name}</p>
      {appointment.locationMode === "at_home" && (
        <p className="opacity-70">Domicile{appointment.commune ? ` · ${appointment.commune}` : ""}</p>
      )}
    </Link>
  );
}

function BlockedSlotBlock({ slot }: { slot: DbBlockedSlot }) {
  return (
    <div
      className="absolute inset-x-1 overflow-hidden rounded-sm border border-white/20 bg-white/5 px-2 py-1 text-xs text-[var(--color-muted)]"
      style={{
        top: getTopOffset(slot.startDatetime),
        height: getBlockHeight(slot.startDatetime, slot.endDatetime),
      }}
    >
      <p className="font-medium">Indisponible</p>
      {slot.reason && <p className="opacity-80">{slot.reason}</p>}
    </div>
  );
}

function DayTimeline({
  day,
  appointments,
  blockedSlots,
  schedules,
}: {
  day: Date;
  appointments: DbCalendarAppointment[];
  blockedSlots: DbBlockedSlot[];
  schedules: DaySchedule[];
}) {
  const daySchedule = schedules.find((schedule) => schedule.dayOfWeek === day.getDay());
  const dayAppointments = appointments.filter((item) => isSameDay(item.startTime, day));
  const dayBlocks = blockedSlots.filter(
    (item) => isSameDay(item.startDatetime, day) || isSameDay(item.endDatetime, day),
  );

  return (
    <div className="rounded-sm border border-white/10 bg-[var(--color-surface)]">
      <div className="grid grid-cols-[64px_1fr]">
        <div>
          {CALENDAR_HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b border-white/5 px-2 text-xs text-[var(--color-muted)]"
              style={{ height: HOUR_HEIGHT }}
            >
              {hour}h
            </div>
          ))}
        </div>
        <div className="relative border-l border-white/10">
          {CALENDAR_HOURS.map((hour) => (
            <div key={hour} className="border-b border-white/5" style={{ height: HOUR_HEIGHT }} />
          ))}
          {daySchedule?.closed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm text-[var(--color-muted)]">
              Fermé
            </div>
          )}
          {dayAppointments.map((appointment) => (
            <AppointmentBlock key={appointment.id} appointment={appointment} />
          ))}
          {dayBlocks.map((slot) => (
            <BlockedSlotBlock key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({
  date,
  appointments,
  blockedSlots,
  schedules,
}: {
  date: Date;
  appointments: DbCalendarAppointment[];
  blockedSlots: DbBlockedSlot[];
  schedules: DaySchedule[];
}) {
  const days = getWeekDays(getWeekStart(date));

  return (
    <div className="overflow-x-auto rounded-sm border border-white/10 bg-[var(--color-surface)]">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/10">
          <div />
          {days.map((day) => (
            <div key={formatDateKey(day)} className="px-2 py-3 text-center text-sm">
              <p className="font-medium capitalize">{formatShortDate(day)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          <div>
            {CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-white/5 px-2 text-xs text-[var(--color-muted)]"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour}h
              </div>
            ))}
          </div>

          {days.map((day) => {
            const daySchedule = schedules.find((schedule) => schedule.dayOfWeek === day.getDay());
            const dayAppointments = appointments.filter((item) => isSameDay(item.startTime, day));
            const dayBlocks = blockedSlots.filter(
              (item) =>
                (item.startDatetime <= addDays(day, 1) && item.endDatetime >= day) ||
                isSameDay(item.startDatetime, day),
            );

            return (
              <div key={formatDateKey(day)} className="relative border-l border-white/10">
                {CALENDAR_HOURS.map((hour) => (
                  <div key={hour} className="border-b border-white/5" style={{ height: HOUR_HEIGHT }} />
                ))}
                {daySchedule?.closed && (
                  <div className="pointer-events-none absolute inset-0 bg-black/20" />
                )}
                {dayAppointments.map((appointment) => (
                  <AppointmentBlock key={appointment.id} appointment={appointment} />
                ))}
                {dayBlocks.map((slot) => (
                  <BlockedSlotBlock key={slot.id} slot={slot} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthView({
  date,
  appointments,
}: {
  date: Date;
  appointments: DbCalendarAppointment[];
}) {
  const monthStart = getMonthStart(date);
  const grid = getMonthGrid(monthStart);

  return (
    <div className="overflow-hidden rounded-sm border border-white/10 bg-[var(--color-surface)]">
      <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs text-[var(--color-muted)]">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
          <div key={label} className="px-2 py-2 font-medium">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((day) => {
          const inMonth = day.getMonth() === monthStart.getMonth();
          const dayAppointments = appointments.filter((item) => isSameDay(item.startTime, day));

          return (
            <Link
              key={formatDateKey(day)}
              href={buildCalendarUrl("day", day)}
              className={`min-h-24 border border-white/5 p-2 transition-colors hover:bg-white/5 ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <p className="text-sm font-medium">{day.getDate()}</p>
              <div className="mt-2 space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/admin/appointments/${appointment.id}`}
                    className={`block truncate rounded-sm border px-1 py-0.5 text-[10px] ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
                  >
                    {appointment.client.name}
                  </Link>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-[10px] text-[var(--color-muted)]">
                    +{dayAppointments.length - 3} RDV
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminCalendar({
  view,
  date,
  appointments,
  blockedSlots,
  schedules,
}: {
  view: CalendarView;
  date: Date;
  appointments: DbCalendarAppointment[];
  blockedSlots: DbBlockedSlot[];
  schedules: DaySchedule[];
}) {
  return (
    <div>
      <CalendarNav view={view} date={date} />

      <div className="mt-6">
        {view === "day" && (
          <DayTimeline
            day={date}
            appointments={appointments}
            blockedSlots={blockedSlots}
            schedules={schedules}
          />
        )}
        {view === "week" && (
          <WeekView
            date={date}
            appointments={appointments}
            blockedSlots={blockedSlots}
            schedules={schedules}
          />
        )}
        {view === "month" && <MonthView date={date} appointments={appointments} />}
      </div>

      <StatusLegend />
    </div>
  );
}

export { getViewRange, type CalendarView };
