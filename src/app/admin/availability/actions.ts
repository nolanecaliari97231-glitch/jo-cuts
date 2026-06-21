"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  replaceWeeklySchedule,
} from "@/lib/availability-data";
import { WEEKDAYS, timeToMinutes, type DaySchedule } from "@/lib/schedule";

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }
  return session;
}

function parseTimeField(value: FormDataEntryValue | null, fallback: string): string {
  const time = String(value ?? "").trim();
  return /^\d{2}:\d{2}$/.test(time) ? time : fallback;
}

function parseWeeklySchedule(formData: FormData): DaySchedule[] | { error: string } {
  const schedules: DaySchedule[] = [];

  for (const { dayOfWeek, label } of WEEKDAYS) {
    const closed = formData.get(`closed-${dayOfWeek}`) === "on";
    const morningStart = parseTimeField(formData.get(`morningStart-${dayOfWeek}`), "07:00");
    const morningEnd = parseTimeField(formData.get(`morningEnd-${dayOfWeek}`), "12:00");
    const afternoonStart = parseTimeField(formData.get(`afternoonStart-${dayOfWeek}`), "12:30");
    const afternoonEnd = parseTimeField(formData.get(`afternoonEnd-${dayOfWeek}`), "17:00");

    if (!closed) {
      if (timeToMinutes(morningEnd) <= timeToMinutes(morningStart)) {
        return { error: `${label} : l'horaire du matin est invalide.` };
      }
      if (timeToMinutes(afternoonEnd) <= timeToMinutes(afternoonStart)) {
        return { error: `${label} : l'horaire de l'après-midi est invalide.` };
      }
      if (timeToMinutes(afternoonStart) < timeToMinutes(morningEnd)) {
        return { error: `${label} : la pause déjeuner chevauche les créneaux.` };
      }
    }

    schedules.push({
      dayOfWeek,
      label,
      closed,
      morningStart,
      morningEnd,
      afternoonStart,
      afternoonEnd,
    });
  }

  return schedules;
}

function revalidateSchedulePages() {
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/availability");
}

export async function saveWeeklySchedule(formData: FormData) {
  const session = await requireSession();
  const parsed = parseWeeklySchedule(formData);

  if ("error" in parsed) {
    throw new Error(parsed.error);
  }

  await replaceWeeklySchedule(session.staffId, parsed);
  revalidateSchedulePages();
  return { ok: true };
}

export async function createBlockedSlot(formData: FormData) {
  const session = await requireSession();

  const startDate = String(formData.get("startDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error("Dates invalides.");
  }
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    throw new Error("Heures invalides.");
  }

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startDatetime = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes);
  const endDatetime = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);

  if (endDatetime <= startDatetime) {
    throw new Error("La fin doit être après le début.");
  }

  await prisma.blockedSlot.create({
    data: {
      staffId: session.staffId,
      startDatetime,
      endDatetime,
      reason: reason || null,
    },
  });

  revalidateSchedulePages();
  return { ok: true };
}

export async function deleteBlockedSlot(id: string) {
  const session = await requireSession();

  const slot = await prisma.blockedSlot.findFirst({
    where: { id, staffId: session.staffId },
  });

  if (!slot) {
    throw new Error("Blocage introuvable.");
  }

  await prisma.blockedSlot.delete({ where: { id } });
  revalidateSchedulePages();
  return { ok: true };
}