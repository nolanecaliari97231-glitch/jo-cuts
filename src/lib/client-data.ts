import { prisma } from "@/lib/prisma";
import type { AdminAppointment } from "@/lib/appointment-admin";

export type ClientListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  appointmentCount: number;
  lastAppointmentAt: Date | null;
  lastServiceName: string | null;
};

export type ClientProfile = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  appointmentCount: number;
  completedCount: number;
};

export type ClientAppointmentHistoryItem = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AdminAppointment["status"];
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  service: { name: string; price: number };
};

export type DashboardTodayAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AdminAppointment["status"];
  client: { id: string; name: string; phone: string | null };
  service: { name: string };
};

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export async function getClientsForStaff(
  staffId: string,
  search?: string,
): Promise<ClientListItem[]> {
  const query = normalizeSearch(search ?? "");

  const clients = await prisma.client.findMany({
    where: {
      appointments: { some: { staffId } },
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { phone: { contains: query.replace(/\s+/g, "") } },
              { email: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      appointments: {
        where: { staffId },
        orderBy: { startTime: "desc" },
        take: 1,
        include: { service: { select: { name: true } } },
      },
      _count: {
        select: {
          appointments: { where: { staffId } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients
    .map((client) => {
      const last = client.appointments[0];
      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        notes: client.notes,
        createdAt: client.createdAt,
        appointmentCount: client._count.appointments,
        lastAppointmentAt: last?.startTime ?? null,
        lastServiceName: last?.service.name ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastAppointmentAt?.getTime() ?? 0;
      const bTime = b.lastAppointmentAt?.getTime() ?? 0;
      return bTime - aTime;
    });
}

export async function getClientCountForStaff(staffId: string): Promise<number> {
  return prisma.client.count({
    where: { appointments: { some: { staffId } } },
  });
}

export async function getRecentClients(staffId: string, limit = 5): Promise<ClientListItem[]> {
  const clients = await getClientsForStaff(staffId);
  return clients.slice(0, limit);
}

export async function getClientProfileForStaff(
  staffId: string,
  clientId: string,
): Promise<ClientProfile | null> {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      appointments: { some: { staffId } },
    },
    include: {
      _count: {
        select: {
          appointments: { where: { staffId } },
        },
      },
      appointments: {
        where: { staffId, status: "completed" },
        select: { id: true },
      },
    },
  });

  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    createdAt: client.createdAt,
    appointmentCount: client._count.appointments,
    completedCount: client.appointments.length,
  };
}

export async function getClientAppointmentHistory(
  staffId: string,
  clientId: string,
): Promise<ClientAppointmentHistoryItem[]> {
  const appointments = await prisma.appointment.findMany({
    where: { staffId, clientId },
    include: {
      service: { select: { name: true, price: true } },
    },
    orderBy: { startTime: "desc" },
  });

  return appointments.map((appointment) => ({
    id: appointment.id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    locationMode: appointment.locationMode,
    commune: appointment.commune,
    service: {
      name: appointment.service.name,
      price: Number.parseFloat(appointment.service.price.toString()),
    },
  }));
}

export async function updateClientNotes(clientId: string, notes: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: { notes: notes.trim() || null },
  });
}

export async function getTodayAppointmentsForStaff(
  staffId: string,
): Promise<DashboardTodayAppointment[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return prisma.appointment.findMany({
    where: {
      staffId,
      startTime: { gte: start, lt: end },
      status: { in: ["pending", "confirmed"] },
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      service: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function clientBelongsToStaff(staffId: string, clientId: string): Promise<boolean> {
  const count = await prisma.appointment.count({
    where: { staffId, clientId },
  });
  return count > 0;
}
