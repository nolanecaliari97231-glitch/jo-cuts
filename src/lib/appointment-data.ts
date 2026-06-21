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
  addDays,
  combineDateAndTime,
  dayScheduleToWindows,
  startOfDay,
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

async function getBusyPeriods(staffId: string, dayStart: Date, dayEnd: Date): Promise<BusyPeriod[]> {
  const [appointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        staffId,
        status: { in: ["pending", "confirmed"] },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: { startTime: true, endTime: true },
    }),
    getBlockedSlotsForRange(staffId, dayStart, dayEnd),
  ]);

  return [
    ...appointments.map((item) => ({ start: item.startTime, end: item.endTime })),
    ...blockedSlots.map((item) => ({ start: item.startDatetime, end: item.endDatetime })),
  ];
}

export async function getAvailableSlots(serviceId: string, dateKey: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return [];
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const staffId = await getDefaultStaffId();
  const schedules = await getWeeklySchedule(staffId);
  const windows = schedules.flatMap((schedule) => dayScheduleToWindows(schedule));

  if (!isDateBookable(date, windows)) return [];

  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);
  const busyPeriods = await getBusyPeriods(staffId, dayStart, dayEnd);
  const slotStarts = generateSlotStartsForDay(date, windows);

  return filterAvailableSlots(date, slotStarts, service.durationMinutes, busyPeriods);
}

export async function getBookableDates(serviceId: string, fromDateKey?: string): Promise<string[]> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const staffId = await getDefaultStaffId();
  const schedules = await getWeeklySchedule(staffId);
  const windows = schedules.flatMap((schedule) => dayScheduleToWindows(schedule));

  const start =
    fromDateKey && /^\d{4}-\d{2}-\d{2}$/.test(fromDateKey)
      ? (() => {
          const [year, month, day] = fromDateKey.split("-").map(Number);
          return startOfDay(new Date(year, month - 1, day));
        })()
      : startOfDay(new Date());

  const dates: string[] = [];

  for (let offset = 0; offset <= BOOKING_HORIZON_DAYS; offset += 1) {
    const date = addDays(start, offset);
    if (!isDateBookable(date, windows)) continue;

    const dayStart = startOfDay(date);
    const dayEnd = addDays(dayStart, 1);
    const busyPeriods = await getBusyPeriods(staffId, dayStart, dayEnd);
    const slotStarts = generateSlotStartsForDay(date, windows);
    const available = filterAvailableSlots(
      date,
      slotStarts,
      service.durationMinutes,
      busyPeriods,
    );

    if (available.length > 0) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const dayNum = String(date.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${dayNum}`);
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

  const [year, month, day] = input.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const startTime = combineDateAndTime(date, input.time);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);
  const staffId = await getDefaultStaffId();

  const slots = await getAvailableSlots(input.serviceId, input.date);
  if (!slots.includes(input.time)) {
    return { error: "Ce créneau n'est plus disponible. Choisissez un autre horaire." };
  }

  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);
  const busyPeriods = await getBusyPeriods(staffId, dayStart, dayEnd);
  if (busyPeriods.some((period) => rangesOverlap(startTime, endTime, period.start, period.end))) {
    return { error: "Ce créneau vient d'être réservé. Choisissez un autre horaire." };
  }

  const phone = normalizePhone(input.clientPhone);
  const email = input.clientEmail?.trim() || null;

  const appointment = await prisma.$transaction(async (tx) => {
    let client = await tx.client.findFirst({ where: { phone } });

    if (client) {
      client = await tx.client.update({
        where: { id: client.id },
        data: {
          name: input.clientName.trim(),
          email: email ?? client.email,
        },
      });
    } else {
      client = await tx.client.create({
        data: {
          name: input.clientName.trim(),
          phone,
          email,
        },
      });
    }

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
