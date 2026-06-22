import { prisma } from "@/lib/prisma";
import { privateSalonLocation, salon } from "@/lib/salon";
import { formatLongDate, formatTime } from "@/lib/schedule";

export async function createSystemMessage(appointmentId: string, body: string) {
  return prisma.appointmentMessage.create({
    data: {
      appointmentId,
      sender: "system",
      body,
    },
  });
}

export async function createStaffMessage(appointmentId: string, body: string) {
  return prisma.appointmentMessage.create({
    data: {
      appointmentId,
      sender: "staff",
      body,
    },
  });
}

export async function getAppointmentMessages(appointmentId: string) {
  return prisma.appointmentMessage.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "asc" },
  });
}

export function buildConfirmationMessage(input: {
  startTime: Date;
  endTime: Date;
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  travelSupplement: number | null;
  staffMessage: string | null;
}): string {
  const lines = [
    "Votre rendez-vous est confirmé.",
    "",
    `Date : ${formatLongDate(input.startTime)}`,
    `Heure : ${formatTime(input.startTime)} – ${formatTime(input.endTime)}`,
  ];

  if (input.locationMode === "at_barber") {
    lines.push(
      "",
      "Adresse (chez le barbier) :",
      privateSalonLocation.mapsLink,
      "",
      "Ouvrez le lien Google Maps pour l'itinéraire.",
    );
  } else {
    lines.push(
      "",
      `Prestation à domicile${input.commune ? ` — ${input.commune}` : ""}.`,
    );
    if (input.travelSupplement != null) {
      lines.push(`Supplément déplacement : ${input.travelSupplement} €`);
    }
  }

  if (input.staffMessage?.trim()) {
    lines.push("", "Message du barbier :", input.staffMessage.trim());
  }

  lines.push("", `Contact : ${salon.phone} — ${salon.email}`);

  return lines.join("\n");
}

export function buildRefusalMessage(staffMessage: string | null): string {
  const lines = [
    "Votre demande de rendez-vous n'a pas pu être acceptée pour ce créneau.",
    "",
    "Choisissez un autre créneau sur le site ou contactez le barbier.",
  ];

  if (staffMessage?.trim()) {
    lines.push("", "Message du barbier :", staffMessage.trim());
  }

  lines.push("", `Contact : ${salon.phone}`);

  return lines.join("\n");
}
