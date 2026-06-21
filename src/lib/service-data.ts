import { prisma } from "@/lib/prisma";
import type { ServiceItem } from "@/lib/salon";
import { serviceCategories as fallbackCategories } from "@/lib/salon";

/** Libellés affichés quand la durée réelle dépasse un créneau de 30 min. */
const DURATION_LABELS: Record<string, string> = {
  "Coupe + barbe": "40–45 min",
};

export type DbService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  category: string;
  active: boolean;
};

export function formatServiceItem(service: {
  name: string;
  description: string | null;
  durationMinutes: number;
  price: { toString(): string } | number;
}): ServiceItem {
  const price =
    typeof service.price === "number"
      ? service.price
      : Number.parseFloat(service.price.toString());

  return {
    name: service.name,
    description: service.description ?? "",
    duration: DURATION_LABELS[service.name] ?? `${service.durationMinutes} min`,
    price: Number.isInteger(price) ? String(price) : price.toFixed(2),
  };
}

export async function getAllServices(): Promise<DbService[]> {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: Number.parseFloat(service.price.toString()),
    category: service.category,
    active: service.active,
  }));
}

export async function getActiveServiceCategories(): Promise<
  { name: string; services: ServiceItem[] }[]
> {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  if (services.length === 0) {
    return fallbackCategories;
  }

  const grouped = new Map<string, ServiceItem[]>();

  for (const service of services) {
    const items = grouped.get(service.category) ?? [];
    items.push(formatServiceItem(service));
    grouped.set(service.category, items);
  }

  return Array.from(grouped.entries()).map(([name, categoryServices]) => ({
    name,
    services: categoryServices,
  }));
}

export async function getFeaturedServices(): Promise<ServiceItem[]> {
  const categories = await getActiveServiceCategories();
  return categories.map((category) => category.services[0]).filter(Boolean);
}

export async function getActiveServiceCount(): Promise<number> {
  return prisma.service.count({ where: { active: true } });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}
