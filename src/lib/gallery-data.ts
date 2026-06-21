import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-safe";
import type { GalleryImage } from "@/lib/salon";
import { galleryImages as fallbackGalleryImages } from "@/lib/salon";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/gallery");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isBlobUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes("blob.vercel-storage.com");
}

export type DbGalleryImage = {
  id: string;
  url: string;
  title: string;
  alt: string | null;
  focus: string | null;
  sortOrder: number;
  createdAt: Date;
};

export function toPublicGalleryImage(image: DbGalleryImage): GalleryImage & { id: string } {
  return {
    id: image.id,
    src: image.url,
    alt: image.alt ?? image.title,
    title: image.title,
    focus: image.focus ?? undefined,
  };
}

export async function getPublicGalleryImages(): Promise<(GalleryImage & { id: string })[]> {
  return withDbFallback(async () => {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (images.length === 0) {
      return fallbackGalleryImages.map((image, index) => ({
        ...image,
        id: `fallback-${index}`,
      }));
    }

    return images.map((image) => toPublicGalleryImage(image));
  }, fallbackGalleryImages.map((image, index) => ({ ...image, id: `fallback-${index}` })));
}

export async function getAllGalleryImages(): Promise<DbGalleryImage[]> {
  return prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getGalleryImageById(id: string): Promise<DbGalleryImage | null> {
  return prisma.galleryImage.findUnique({ where: { id } });
}

export async function getNextSortOrder(): Promise<number> {
  const last = await prisma.galleryImage.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function saveGalleryUpload(file: File): Promise<string> {
  const extension = ALLOWED_MIME_TYPES.get(file.type);
  if (!extension) {
    throw new Error("Format non supporté. Utilisez JPG, PNG ou WebP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux (maximum 5 Mo).");
  }

  const filename = `${randomUUID()}.${extension}`;

  if (isBlobStorageEnabled()) {
    const blob = await put(`gallery/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return `/uploads/gallery/${filename}`;
}

export async function deleteGalleryFile(url: string) {
  if (isBlobUrl(url)) {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }

  if (!url.startsWith("/uploads/gallery/")) return;

  const filepath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filepath);
  } catch {
    // Fichier déjà absent — ignorer.
  }
}

export async function syncDefaultGalleryImages() {
  const count = await prisma.galleryImage.count();
  if (count > 0) return;

  await prisma.galleryImage.createMany({
    data: fallbackGalleryImages.map((image, index) => ({
      url: image.src,
      title: image.title,
      alt: image.alt,
      focus: image.focus ?? "50% 40%",
      sortOrder: index,
    })),
  });

  console.log("Galerie par défaut créée.");
}

export async function swapGallerySortOrder(id: string, direction: "up" | "down") {
  const current = await prisma.galleryImage.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await prisma.galleryImage.findFirst({
    where: {
      sortOrder: direction === "up" ? { lt: current.sortOrder } : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.galleryImage.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.galleryImage.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
}
