"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }
  return session;
}

type ServiceInput = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  active: boolean;
};

function parseServiceForm(formData: FormData): ServiceInput | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") ?? ""), 10);
  const price = Number.parseFloat(String(formData.get("price") ?? "").replace(",", "."));
  const active = formData.get("active") === "on";

  if (!name) return { error: "Le nom est requis." };
  if (!category) return { error: "La catégorie est requise." };
  if (!Number.isFinite(durationMinutes) || durationMinutes < 5) {
    return { error: "Durée invalide (minimum 5 min)." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Prix invalide." };
  }

  return { name, description, durationMinutes, price, category, active };
}

function revalidateServicePages() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin");
  revalidatePath("/admin/services");
}

export async function createService(formData: FormData) {
  await requireSession();

  const parsed = parseServiceForm(formData);
  if ("error" in parsed) {
    throw new Error(parsed.error);
  }

  await prisma.service.create({
    data: {
      name: parsed.name,
      description: parsed.description || null,
      durationMinutes: parsed.durationMinutes,
      price: parsed.price,
      category: parsed.category,
      active: parsed.active,
    },
  });

  revalidateServicePages();
  redirect("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  await requireSession();

  const parsed = parseServiceForm(formData);
  if ("error" in parsed) {
    throw new Error(parsed.error);
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Service introuvable.");
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.name,
      description: parsed.description || null,
      durationMinutes: parsed.durationMinutes,
      price: parsed.price,
      category: parsed.category,
      active: parsed.active,
    },
  });

  revalidateServicePages();
  redirect("/admin/services");
}

export async function toggleServiceActive(id: string) {
  await requireSession();

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return { error: "Service introuvable." };

  await prisma.service.update({
    where: { id },
    data: { active: !service.active },
  });

  revalidateServicePages();
  return { ok: true };
}

export async function deleteService(id: string) {
  await requireSession();

  const appointmentCount = await prisma.appointment.count({ where: { serviceId: id } });
  if (appointmentCount > 0) {
    return {
      error: "Ce service est lié à des rendez-vous. Désactivez-le plutôt que de le supprimer.",
    };
  }

  await prisma.service.delete({ where: { id } });
  revalidateServicePages();
  return { ok: true };
}

export async function getCategoryOptions() {
  return [...SERVICE_CATEGORIES];
}
