"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteGalleryFile,
  getGalleryImageById,
  getNextSortOrder,
  saveGalleryUpload,
  swapGallerySortOrder,
} from "@/lib/gallery-data";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }
  return session;
}

function revalidateGalleryPages() {
  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin/gallery");
}

function parseMetadata(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const focus = String(formData.get("focus") ?? "50% 40%").trim() || "50% 40%";

  if (!title) {
    return { error: "Le titre est requis." } as const;
  }

  return { title, alt: alt || null, focus };
}

export async function uploadGalleryImage(formData: FormData) {
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionnez une image." };
  }

  const metadata = parseMetadata(formData);
  if ("error" in metadata) {
    return metadata;
  }

  try {
    const url = await saveGalleryUpload(file);
    const sortOrder = await getNextSortOrder();

    await prisma.galleryImage.create({
      data: {
        url,
        title: metadata.title,
        alt: metadata.alt,
        focus: metadata.focus,
        sortOrder,
      },
    });

    revalidateGalleryPages();
    return { ok: true as const };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Impossible d'ajouter l'image.",
    };
  }
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireSession();

  const existing = await getGalleryImageById(id);
  if (!existing) {
    throw new Error("Image introuvable.");
  }

  const metadata = parseMetadata(formData);
  if ("error" in metadata) {
    throw new Error(metadata.error);
  }

  await prisma.galleryImage.update({
    where: { id },
    data: {
      title: metadata.title,
      alt: metadata.alt,
      focus: metadata.focus,
    },
  });

  revalidateGalleryPages();
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  await requireSession();

  const existing = await getGalleryImageById(id);
  if (!existing) {
    return { error: "Image introuvable." };
  }

  await deleteGalleryFile(existing.url);
  await prisma.galleryImage.delete({ where: { id } });

  revalidateGalleryPages();
  return { ok: true as const };
}

export async function moveGalleryImage(id: string, direction: "up" | "down") {
  await requireSession();
  await swapGallerySortOrder(id, direction);
  revalidateGalleryPages();
  return { ok: true as const };
}
