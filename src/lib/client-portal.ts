import { prisma } from "@/lib/prisma";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/schedule";

export type ClientAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "refused" | "cancelled" | "completed";
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  paymentMethod: string | null;
  travelSupplement: number | null;
  staffMessage: string | null;
  createdAt: Date;
  service: { name: string; price: number; durationMinutes: number };
  messageCount: number;
};

export async function getClientProfile(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  });
}

export async function upsertClientFromGoogle(profile: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}) {
  const existingByGoogle = await prisma.client.findUnique({
    where: { googleId: profile.googleId },
  });

  if (existingByGoogle) {
    return prisma.client.update({
      where: { id: existingByGoogle.id },
      data: {
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.picture ?? existingByGoogle.avatarUrl,
      },
    });
  }

  const existingByEmail = profile.email
    ? await prisma.client.findUnique({ where: { email: profile.email } })
    : null;

  if (existingByEmail) {
    return prisma.client.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: profile.googleId,
        name: profile.name,
        avatarUrl: profile.picture ?? existingByEmail.avatarUrl,
      },
    });
  }

  return prisma.client.create({
    data: {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    },
  });
}

export async function getClientAppointments(clientId: string): Promise<ClientAppointment[]> {
  const appointments = await prisma.appointment.findMany({
    where: { clientId },
    orderBy: { startTime: "desc" },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      _count: { select: { messages: true } },
    },
  });

  return appointments.map((appointment) => ({
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
    createdAt: appointment.createdAt,
    service: {
      name: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      price: Number.parseFloat(appointment.service.price.toString()),
    },
    messageCount: appointment._count.messages,
  }));
}

export async function getClientAppointmentById(clientId: string, appointmentId: string) {
  return prisma.appointment.findFirst({
    where: { id: appointmentId, clientId },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export function statusLabel(status: ClientAppointment["status"]): string {
  return APPOINTMENT_STATUS_LABELS[status];
}
