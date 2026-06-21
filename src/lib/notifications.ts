import { formatEuro, sendEmail } from "@/lib/email";
import { privateSalonLocation, salon } from "@/lib/salon";
import { formatLongDate, formatTime } from "@/lib/schedule";

type AppointmentEmailContext = {
  id: string;
  startTime: Date;
  endTime: Date;
  locationMode: "at_barber" | "at_home";
  commune: string | null;
  paymentMethod: string | null;
  travelSupplement: number | null;
  staffMessage: string | null;
  notes: string | null;
  client: { name: string; phone: string; email: string | null };
  service: { name: string; price: number; durationMinutes: number };
  staff: { name: string; email: string };
};

function paymentLabel(method: string | null): string {
  return salon.paymentMethods.find((item) => item.id === method)?.label ?? method ?? "—";
}

function locationLabel(appointment: Pick<AppointmentEmailContext, "locationMode" | "commune">): string {
  if (appointment.locationMode === "at_home") {
    return `À domicile${appointment.commune ? ` — ${appointment.commune}` : ""}`;
  }
  return "Chez le barbier";
}

function appointmentSummaryHtml(appointment: AppointmentEmailContext): string {
  const servicePrice = formatEuro(appointment.service.price);
  const travelLine =
    appointment.locationMode === "at_home" && appointment.travelSupplement != null
      ? `<p><strong>Supplément déplacement :</strong> ${formatEuro(appointment.travelSupplement)}</p>`
      : "";

  return `
    <p><strong>Prestation :</strong> ${appointment.service.name} (${servicePrice})</p>
    <p><strong>Date :</strong> ${formatLongDate(appointment.startTime)}</p>
    <p><strong>Heure :</strong> ${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}</p>
    <p><strong>Lieu :</strong> ${locationLabel(appointment)}</p>
    <p><strong>Paiement :</strong> ${paymentLabel(appointment.paymentMethod)}</p>
    ${travelLine}
  `;
}

export async function notifyStaffNewBooking(appointment: AppointmentEmailContext) {
  const adminUrl = `${getSiteUrl()}/admin/appointments/${appointment.id}`;

  return sendEmail({
    to: appointment.staff.email,
    subject: `[JO'Cuts] Nouvelle demande de RDV — ${appointment.client.name}`,
    html: `
      <p>Bonjour ${appointment.staff.name},</p>
      <p>Une nouvelle demande de rendez-vous est en attente de validation.</p>
      ${appointmentSummaryHtml(appointment)}
      <p><strong>Client :</strong> ${appointment.client.name} — ${appointment.client.phone}${
        appointment.client.email ? ` — ${appointment.client.email}` : ""
      }</p>
      ${appointment.notes ? `<p><strong>Message client :</strong><br>${escapeHtml(appointment.notes).replace(/\n/g, "<br>")}</p>` : ""}
      <p><a href="${adminUrl}">Ouvrir la demande dans le back-office</a></p>
    `,
    text: `Nouvelle demande RDV de ${appointment.client.name}. Voir ${adminUrl}`,
  });
}

export async function notifyClientBookingConfirmed(appointment: AppointmentEmailContext) {
  if (!appointment.client.email) {
    return { ok: true, skipped: true as const };
  }

  const locationDetails =
    appointment.locationMode === "at_barber"
      ? `<p><strong>Adresse :</strong> communiquée via Google Maps après validation.</p>
         <p><a href="${privateSalonLocation.mapsLink}">Ouvrir l'itinéraire Google Maps</a></p>`
      : `<p>Le barbier se déplace chez vous${appointment.commune ? ` (${appointment.commune})` : ""}.</p>`;

  const staffBlock = appointment.staffMessage
    ? `<p><strong>Message du barbier :</strong><br>${escapeHtml(appointment.staffMessage).replace(/\n/g, "<br>")}</p>`
    : "";

  return sendEmail({
    to: appointment.client.email,
    subject: `[JO'Cuts] Rendez-vous confirmé`,
    html: `
      <p>Bonjour ${appointment.client.name},</p>
      <p>Votre rendez-vous chez ${salon.name} est <strong>confirmé</strong>.</p>
      ${appointmentSummaryHtml(appointment)}
      ${locationDetails}
      ${staffBlock}
      <p>Contact barbier : ${salon.phone} — ${salon.email}</p>
    `,
    text: `Votre RDV JO'Cuts est confirmé le ${formatLongDate(appointment.startTime)} à ${formatTime(appointment.startTime)}.`,
  });
}

export async function notifyClientBookingRefused(
  appointment: AppointmentEmailContext,
  reason?: string,
) {
  if (!appointment.client.email) {
    return { ok: true, skipped: true as const };
  }

  const message = reason ?? appointment.staffMessage;

  return sendEmail({
    to: appointment.client.email,
    subject: `[JO'Cuts] Demande de rendez-vous non disponible`,
    html: `
      <p>Bonjour ${appointment.client.name},</p>
      <p>Votre demande de rendez-vous n'a pas pu être acceptée pour le créneau suivant :</p>
      ${appointmentSummaryHtml(appointment)}
      ${
        message
          ? `<p><strong>Message :</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
          : "<p>N'hésitez pas à choisir un autre créneau sur le site ou à contacter le barbier.</p>"
      }
      <p><a href="${getSiteUrl()}/rendez-vous">Prendre un nouveau rendez-vous</a></p>
      <p>Contact : ${salon.phone} — ${salon.email}</p>
    `,
    text: `Votre demande RDV JO'Cuts n'a pas été acceptée.`,
  });
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type { AppointmentEmailContext };
