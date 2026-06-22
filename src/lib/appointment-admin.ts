import {
  buildConfirmationMessage,
  buildRefusalMessage,
  createSystemMessage,
} from "@/lib/appointment-messages";
import type { AppointmentEmailContext } from "@/lib/notifications";
import {
  notifyClientBookingConfirmed,
  notifyClientBookingRefused,
  notifyStaffNewBooking,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export type AdminAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "refused" | "cancelled" | "completed";
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  paymentMethod: string | null;
  travelSupplement: number | null;
  staffMessage: string | null;
  notes: string | null;
  createdAt: Date;
  client: { id: string; name: string; phone: string | null; email: string | null };
  service: { id: string; name: string; durationMinutes: number; price: number };
};

const appointmentInclude = {
  client: { select: { id: true, name: true, phone: true, email: true } },
  service: {
    select: { id: true, name: true, durationMinutes: true, price: true },
  },
  staff: { select: { id: true, name: true, email: true } },
} as const;

function mapAppointment(appointment: {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AdminAppointment["status"];
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  paymentMethod: string | null;
  travelSupplement: { toString(): string } | null;
  staffMessage: string | null;
  notes: string | null;
  createdAt: Date;
  client: AdminAppointment["client"];
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: { toString(): string };
  };
}): AdminAppointment {
  return {
    id: appointment.id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    locationMode: appointment.locationMode,
    commune: appointment.commune,
    paymentMethod: appointment.paymentMethod,
    travelSupplement: appointment.travelSupplement
      ? Number.parseFloat(appointment.travelSupplement.toString())
      : null,
    staffMessage: appointment.staffMessage,
    notes: appointment.notes,
    createdAt: appointment.createdAt,
    client: appointment.client,
    service: {
      id: appointment.service.id,
      name: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      price: Number.parseFloat(appointment.service.price.toString()),
    },
  };
}

function mapEmailContext(appointment: {
  id: string;
  startTime: Date;
  endTime: Date;
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  paymentMethod: string | null;
  travelSupplement: { toString(): string } | null;
  staffMessage: string | null;
  notes: string | null;
  client: { name: string; phone: string | null; email: string | null };
  service: { name: string; durationMinutes: number; price: { toString(): string } };
  staff: { name: string; email: string };
}): AppointmentEmailContext {
  return {
    id: appointment.id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    locationMode: appointment.locationMode,
    commune: appointment.commune,
    paymentMethod: appointment.paymentMethod,
    travelSupplement: appointment.travelSupplement
      ? Number.parseFloat(appointment.travelSupplement.toString())
      : null,
    staffMessage: appointment.staffMessage,
    notes: appointment.notes,
    client: appointment.client,
    service: {
      name: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      price: Number.parseFloat(appointment.service.price.toString()),
    },
    staff: appointment.staff,
  };
}

export async function getStaffAppointments(
  staffId: string,
  status?: AdminAppointment["status"] | "all",
): Promise<AdminAppointment[]> {
  const appointments = await prisma.appointment.findMany({
    where: {
      staffId,
      ...(status && status !== "all" ? { status } : {}),
    },
    include: appointmentInclude,
    orderBy:
      status === "pending"
        ? { startTime: "asc" }
        : [{ startTime: "desc" }],
  });

  return appointments.map(mapAppointment);
}

export async function getPendingAppointments(staffId: string): Promise<AdminAppointment[]> {
  return getStaffAppointments(staffId, "pending");
}

export async function getStaffAppointmentById(
  staffId: string,
  id: string,
): Promise<(AdminAppointment & { staff: { id: string; name: string; email: string } }) | null> {
  const appointment = await prisma.appointment.findFirst({
    where: { id, staffId },
    include: appointmentInclude,
  });

  if (!appointment) return null;

  return {
    ...mapAppointment(appointment),
    staff: appointment.staff,
  };
}

export async function getAppointmentEmailContext(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, phone: true, email: true } },
      service: { select: { name: true, durationMinutes: true, price: true } },
      staff: { select: { name: true, email: true } },
    },
  });
}

export async function sendNewBookingNotifications(appointmentId: string) {
  const appointment = await getAppointmentEmailContext(appointmentId);
  if (!appointment) return;

  await notifyStaffNewBooking(mapEmailContext(appointment));
}

export async function confirmAppointment(input: {
  staffId: string;
  appointmentId: string;
  travelSupplement?: number;
  staffMessage?: string;
}) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: input.appointmentId, staffId: input.staffId },
    include: appointmentInclude,
  });

  if (!appointment) {
    return { error: "Rendez-vous introuvable." };
  }

  if (appointment.status !== "pending") {
    return { error: "Seules les demandes en attente peuvent être confirmées." };
  }

  if (appointment.locationMode === "at_home") {
    if (input.travelSupplement == null || !Number.isFinite(input.travelSupplement)) {
      return { error: "Indiquez le supplément de déplacement pour une prestation à domicile." };
    }
    if (input.travelSupplement < 0) {
      return { error: "Supplément de déplacement invalide." };
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "confirmed",
      travelSupplement:
        appointment.locationMode === "at_home" ? input.travelSupplement ?? null : null,
      staffMessage: input.staffMessage?.trim() || null,
    },
    include: appointmentInclude,
  });

  const emailContext = mapEmailContext(updated);
  await createSystemMessage(
    updated.id,
    buildConfirmationMessage({
      startTime: updated.startTime,
      endTime: updated.endTime,
      locationMode: updated.locationMode,
      commune: updated.commune,
      travelSupplement: updated.travelSupplement
        ? Number.parseFloat(updated.travelSupplement.toString())
        : null,
      staffMessage: updated.staffMessage,
    }),
  );
  await notifyClientBookingConfirmed(emailContext);

  return { ok: true as const };
}

export async function refuseAppointment(input: {
  staffId: string;
  appointmentId: string;
  staffMessage?: string;
}) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: input.appointmentId, staffId: input.staffId },
    include: appointmentInclude,
  });

  if (!appointment) {
    return { error: "Rendez-vous introuvable." };
  }

  if (appointment.status !== "pending") {
    return { error: "Seules les demandes en attente peuvent être refusées." };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "refused",
      staffMessage: input.staffMessage?.trim() || null,
    },
    include: appointmentInclude,
  });

  await createSystemMessage(
    updated.id,
    buildRefusalMessage(input.staffMessage ?? updated.staffMessage),
  );
  await notifyClientBookingRefused(mapEmailContext(updated), input.staffMessage);

  return { ok: true as const };
}

export async function cancelAppointment(staffId: string, appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, staffId },
  });

  if (!appointment) {
    return { error: "Rendez-vous introuvable." };
  }

  if (!["pending", "confirmed"].includes(appointment.status)) {
    return { error: "Ce rendez-vous ne peut plus être annulé." };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "cancelled" },
  });

  return { ok: true as const };
}

export async function completeAppointment(staffId: string, appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, staffId },
  });

  if (!appointment) {
    return { error: "Rendez-vous introuvable." };
  }

  if (appointment.status !== "confirmed") {
    return { error: "Seuls les rendez-vous confirmés peuvent être marqués terminés." };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "completed" },
  });

  return { ok: true as const };
}
