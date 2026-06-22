import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-safe";
import type { OpeningHour } from "@/lib/salon";
import { salon } from "@/lib/salon";
import {
  DEFAULT_WEEKLY_SCHEDULE,
  type DaySchedule,
  WEEKDAYS,
  dayScheduleToWindows,
  schedulesToOpeningHours,
  windowsToDaySchedule,
} from "@/lib/schedule";

export type DbBlockedSlot = {
  id: string;
  startDatetime: Date;
  endDatetime: Date;
  reason: string | null;
};

export type DbCalendarAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "refused" | "cancelled" | "completed";
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  notes: string | null;
  client: { name: string; phone: string | null };
  service: { name: string; durationMinutes: number };
};

export async function getWeeklySchedule(staffId: string): Promise<DaySchedule[]> {
  const rows = await prisma.availability.findMany({
    where: { staffId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  if (rows.length === 0) {
    return DEFAULT_WEEKLY_SCHEDULE;
  }

  return WEEKDAYS.map(({ dayOfWeek, label }) => {
    const dayRows = rows.filter((row) => row.dayOfWeek === dayOfWeek);
    const schedule = windowsToDaySchedule(dayOfWeek, dayRows);
    return { ...schedule, label };
  });
}

export async function getPublicOpeningHours(): Promise<OpeningHour[]> {
  return withDbFallback(async () => {
    const staff = await prisma.staff.findFirst({ orderBy: { createdAt: "asc" } });
    if (!staff) return [...salon.openingHours];

    const schedules = await getWeeklySchedule(staff.id);
    return schedulesToOpeningHours(schedules);
  }, [...salon.openingHours]);
}

export async function getBlockedSlotsForRange(
  staffId: string,
  start: Date,
  end: Date,
): Promise<DbBlockedSlot[]> {
  return prisma.blockedSlot.findMany({
    where: {
      staffId,
      startDatetime: { lt: end },
      endDatetime: { gt: start },
    },
    orderBy: { startDatetime: "asc" },
  });
}

export async function getUpcomingBlockedSlots(staffId: string, limit = 20): Promise<DbBlockedSlot[]> {
  const now = new Date();
  return prisma.blockedSlot.findMany({
    where: {
      staffId,
      endDatetime: { gte: now },
    },
    orderBy: { startDatetime: "asc" },
    take: limit,
  });
}

export async function getAppointmentsForRange(
  staffId: string,
  start: Date,
  end: Date,
): Promise<DbCalendarAppointment[]> {
  return prisma.appointment.findMany({
    where: {
      staffId,
      startTime: { lt: end },
      endTime: { gt: start },
    },
    include: {
      client: { select: { name: true, phone: true } },
      service: { select: { name: true, durationMinutes: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getTodayAppointmentCount(staffId: string): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return prisma.appointment.count({
    where: {
      staffId,
      startTime: { gte: start, lt: end },
      status: { in: ["pending", "confirmed"] },
    },
  });
}

export async function getPendingAppointmentCount(staffId: string): Promise<number> {
  return prisma.appointment.count({
    where: { staffId, status: "pending" },
  });
}

export async function replaceWeeklySchedule(staffId: string, schedules: DaySchedule[]) {
  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { staffId } });

    const windows = schedules.flatMap((schedule) => dayScheduleToWindows(schedule));
    if (windows.length === 0) return;

    await tx.availability.createMany({
      data: windows.map((window) => ({
        staffId,
        dayOfWeek: window.dayOfWeek,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
    });
  });
}

export async function syncDefaultAvailability(staffId: string) {
  const count = await prisma.availability.count({ where: { staffId } });
  if (count > 0) return;

  await replaceWeeklySchedule(staffId, DEFAULT_WEEKLY_SCHEDULE);
}
