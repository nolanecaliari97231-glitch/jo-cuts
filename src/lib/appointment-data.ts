import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-safe";
import {
  BOOKING_HORIZON_DAYS,
  filterAvailableSlots,
  generateSlotStartsForDay,
  isDateBookable,
  isValidPhone,
  normalizePhone,
  rangesOverlap,
  type BusyPeriod,
} from "@/lib/slots";
import {
  getBlockedSlotsForRange,
  getWeeklySchedule,
} from "@/lib/availability-data";
import { sendNewBookingNotifications } from "@/lib/appointment-admin";
import {
  addDaysToDateKey,
  combineDateAndTime,
  dayScheduleToWindows,
  getSalonTodayKey,
  salonDayEnd,
  salonDayStart,
} from "@/lib/schedule";

export type BookingServiceOption = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
};

export type BookingInput = {
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  locationMode: "at_barber" | "at_home";
  commune?: string;
  paymentMethod: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
};

export async function getDefaultStaffId(): Promise<string> {
  const staff = await prisma.staff.findFirst({ orderBy: { createdAt: "asc" } });
  if (!staff) {
    throw new Error("Aucun barbier configuré.");
  }
  return staff.id;
}

export async function getBookableServices(): Promise<BookingServiceOption[]> {
  return withDbFallback(async () => {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: Number.parseFloat(service.price.toString()),
      category: service.category,
    }));
  }, []);
}

async function getBusyPeriodsForRange(
  staffId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<BusyPeriod[]> {
  const [appointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        staffId,
        status: { in: ["pending", "confirmed"] },
        startTime: { lt: rangeEnd },
        endTime: { gt: rangeStart },
      },
      select: { startTime: true, endTime: true },
    }),
    getBlockedSlotsForRange(staffId, rangeStart, rangeEnd),
  ]);

  return [
    ...appointments.map((item) => ({ start: item.startTime, end: item.endTime })),
    ...blockedSlots.map((item) => ({ start: item.startDatetime, end: item.endDatetime })),
  ];
}

function busyPeriodsForDay(allBusy: BusyPeriod[], dayStart: Date, dayEnd: Date): BusyPeriod[] {
  return allBusy.filter((period) => period.start < dayEnd && period.end > dayStart);
}

export async function getAvailableSlots(serviceId: string, dateKey: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return [];
  }

  const [service, staffId] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, active: true } }),
    getDefaultStaffId(),
  ]);
  if (!service) return [];

  const schedules = await getWeeklySchedule(staffId);
  const windows = schedules.flatMap((schedule) => dayScheduleToWindows(schedule));

  if (!isDateBookable(dateKey, windows)) return [];

  const dayStart = salonDayStart(dateKey);
  const dayEnd = salonDayEnd(dateKey);
  const busyPeriods = await getBusyPeriodsForRange(staffId, dayStart, dayEnd);
  const slotStarts = generateSlotStartsForDay(dateKey, windows);

  return filterAvailableSlots(
    dateKey,
    slotStarts,
    service.durationMinutes,
    busyPeriods,
    windows,
  );
}

export async function getBookableDates(serviceId: string, fromDateKey?: string): Promise<string[]> {
  const [service, staffId] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, active: true } }),
    getDefaultStaffId(),
  ]);
  if (!service) return [];

  const schedules = await getWeeklySchedule(staffId);
  const windows = schedules.flatMap((schedule) => dayScheduleToWindows(schedule));

  const startKey =
    fromDateKey && /^\d{4}-\d{2}-\d{2}$/.test(fromDateKey) ? fromDateKey : getSalonTodayKey();

  const horizonEndKey = addDaysToDateKey(startKey, BOOKING_HORIZON_DAYS);
  const allBusy = await getBusyPeriodsForRange(
    staffId,
    salonDayStart(startKey),
    salonDayEnd(horizonEndKey),
  );

  const dates: string[] = [];

  for (let offset = 0; offset <= BOOKING_HORIZON_DAYS; offset += 1) {
    const dateKey = addDaysToDateKey(startKey, offset);
    if (!isDateBookable(dateKey, windows)) continue;

    const dayStart = salonDayStart(dateKey);
    const dayEnd = salonDayEnd(dateKey);
    const slotStarts = generateSlotStartsForDay(dateKey, windows);
    const available = filterAvailableSlots(
      dateKey,
      slotStarts,
      service.durationMinutes,
      busyPeriodsForDay(allBusy, dayStart, dayEnd),
      windows,
    );

    if (available.length > 0) {
      dates.push(dateKey);
    }
  }

  return dates;
}

export async function createBookingRequest(input: BookingInput) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) {
    return { error: "Service introuvable ou indisponible." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return { error: "Date ou heure invalide." };
  }

  if (!input.clientName.trim()) {
    return { error: "Le nom est requis." };
  }

  if (!isValidPhone(input.clientPhone)) {
    return { error: "Numéro de téléphone invalide." };
  }

  if (input.locationMode === "at_home" && !input.commune?.trim()) {
    return { error: "Indiquez votre commune pour une prestation à domicile." };
  }

  const allowedPayments = ["cash", "card"];
  if (!allowedPayments.includes(input.paymentMethod)) {
    return { error: "Mode de paiement invalide." };
  }

  const startTime = combineDateAndTime(input.date, input.time);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);
  const staffId = await getDefaultStaffId();

  const slots = await getAvailableSlots(input.serviceId, input.date);
  if (!slots.includes(input.time)) {
    return { error: "Ce créneau n'est plus disponible. Choisissez un autre horaire." };
  }

  const dayStart = salonDayStart(input.date);
  const dayEnd = salonDayEnd(input.date);
  const busyPeriods = await getBusyPeriodsForRange(staffId, dayStart, dayEnd);
  if (busyPeriods.some((period) => rangesOverlap(startTime, endTime, period.start, period.end))) {
    return { error: "Ce créneau vient d'être réservé. Choisissez un autre horaire." };
  }

  const phone = normalizePhone(input.clientPhone);

  const appointment = await prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({ where: { id: input.clientId } });
    if (!client) {
      throw new Error("Compte client introuvable.");
    }

    await tx.client.update({
      where: { id: client.id },
      data: {
        name: input.clientName.trim(),
        phone,
      },
    });

    const noteParts: string[] = [];
    if (input.notes?.trim()) noteParts.push(input.notes.trim());
    if (input.locationMode === "at_home") {
      noteParts.push(`Commune : ${input.commune?.trim()}`);
    }

    return tx.appointment.create({
      data: {
        clientId: client.id,
        staffId,
        serviceId: service.id,
        startTime,
        endTime,
        status: "pending",
        locationMode: input.locationMode,
        commune: input.locationMode === "at_home" ? input.commune?.trim() ?? null : null,
        paymentMethod: input.paymentMethod,
        notes: noteParts.length > 0 ? noteParts.join("\n") : null,
      },
      include: {
        service: { select: { name: true, durationMinutes: true, price: true } },
        client: { select: { name: true, phone: true, email: true } },
        staff: { select: { name: true, email: true } },
      },
    });
  });

  await sendNewBookingNotifications(appointment.id);

  return { appointmentId: appointment.id };
}

export async function getBookingConfirmation(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      client: { select: { name: true, phone: true, email: true } },
    },
  });
}
