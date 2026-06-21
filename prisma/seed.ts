import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../src/lib/auth";
import { syncDefaultAvailability } from "../src/lib/availability-data";
import { syncDefaultGalleryImages } from "../src/lib/gallery-data";
import { serviceCategories } from "../src/lib/salon";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function parseDurationMinutes(duration: string): number {
  const matches = duration.match(/\d+/g);
  if (!matches?.length) return 30;
  return Math.max(...matches.map((value) => Number.parseInt(value, 10)));
}

async function syncDefaultServices() {
  const defaults = serviceCategories.flatMap((category) =>
    category.services.map((service) => ({
      name: service.name,
      description: service.description,
      durationMinutes: parseDurationMinutes(service.duration),
      price: Number.parseFloat(service.price),
      category: category.name,
    })),
  );

  const defaultNames = defaults.map((service) => service.name);

  await prisma.service.updateMany({
    where: { name: { notIn: defaultNames } },
    data: { active: false },
  });

  for (const service of defaults) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: service.price,
          category: service.category,
          active: true,
        },
      });
      continue;
    }

    await prisma.service.create({
      data: { ...service, active: true },
    });
  }

  console.log("Services synchronisés avec la configuration du salon.");
}

async function main() {
  const email = (process.env.STAFF_EMAIL ?? "237barber.contact@gmail.com").toLowerCase();
  const password = process.env.STAFF_PASSWORD ?? "Jocuts2026!";
  const name = process.env.STAFF_NAME ?? "JO";

  const passwordHash = await hashPassword(password);

  await prisma.staff.upsert({
    where: { email },
    update: { name, passwordHash, phone: "0696765606" },
    create: {
      name,
      email,
      passwordHash,
      phone: "0696765606",
    },
  });

  const staff = await prisma.staff.findUniqueOrThrow({ where: { email } });
  await syncDefaultAvailability(staff.id);

  await syncDefaultServices();
  await syncDefaultGalleryImages();

  console.log(`Compte barbier prêt : ${email}`);
  console.log("Mot de passe initial : voir STAFF_PASSWORD dans .env");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
