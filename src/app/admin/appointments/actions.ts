"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  refuseAppointment,
} from "@/lib/appointment-admin";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }
  return session;
}

function revalidateAppointmentPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");
}

function parseTravelSupplement(formData: FormData): number | undefined {
  const raw = String(formData.get("travelSupplement") ?? "").trim().replace(",", ".");
  if (!raw) return undefined;
  return Number.parseFloat(raw);
}

export async function confirmAppointmentAction(appointmentId: string, formData: FormData) {
  const session = await requireSession();
  const staffMessage = String(formData.get("staffMessage") ?? "").trim();
  const travelSupplement = parseTravelSupplement(formData);

  const result = await confirmAppointment({
    staffId: session.staffId,
    appointmentId,
    travelSupplement,
    staffMessage: staffMessage || undefined,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateAppointmentPages();
  revalidatePath(`/admin/appointments/${appointmentId}`);
  redirect(`/admin/appointments/${appointmentId}?confirmed=1`);
}

export async function refuseAppointmentAction(appointmentId: string, formData: FormData) {
  const session = await requireSession();
  const staffMessage = String(formData.get("staffMessage") ?? "").trim();

  const result = await refuseAppointment({
    staffId: session.staffId,
    appointmentId,
    staffMessage: staffMessage || undefined,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateAppointmentPages();
  revalidatePath(`/admin/appointments/${appointmentId}`);
  redirect(`/admin/appointments/${appointmentId}?refused=1`);
}

export async function cancelAppointmentAction(appointmentId: string) {
  const session = await requireSession();
  const result = await cancelAppointment(session.staffId, appointmentId);

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateAppointmentPages();
  revalidatePath(`/admin/appointments/${appointmentId}`);
  return { ok: true };
}

export async function completeAppointmentAction(appointmentId: string) {
  const session = await requireSession();
  const result = await completeAppointment(session.staffId, appointmentId);

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateAppointmentPages();
  revalidatePath(`/admin/appointments/${appointmentId}`);
  return { ok: true };
}

export async function quickConfirmAppointment(appointmentId: string) {
  const session = await requireSession();
  const result = await confirmAppointment({
    staffId: session.staffId,
    appointmentId,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateAppointmentPages();
  return { ok: true };
}
