"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteGalleryImage, moveGalleryImage } from "@/app/admin/gallery/actions";
import PortfolioImage, { DEFAULT_PHOTO_FOCUS } from "@/components/PortfolioImage";
import type { DbGalleryImage } from "@/lib/gallery-data";

export default function GalleryAdminList({ images }: { images: DbGalleryImage[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (images.length === 0) {
    return (
      <p className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        Aucune photo en galerie. Ajoutez votre première image ci-dessus.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <li
          key={image.id}
          className="overflow-hidden rounded-sm border border-white/10 bg-[var(--color-surface)]"
        >
          <div className="relative aspect-square">
            <PortfolioImage
              src={image.url}
              alt={image.alt ?? image.title}
              focus={image.focus ?? DEFAULT_PHOTO_FOCUS}
            />
          </div>
          <div className="space-y-3 p-4">
            <div>
              <h3 className="font-medium">{image.title}</h3>
              <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{image.url}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending || index === 0}
                onClick={() => {
                  startTransition(async () => {
                    await moveGalleryImage(image.id, "up");
                    router.refresh();
                  });
                }}
                className="rounded-sm border border-white/20 px-3 py-1 text-xs disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={isPending || index === images.length - 1}
                onClick={() => {
                  startTransition(async () => {
                    await moveGalleryImage(image.id, "down");
                    router.refresh();
                  });
                }}
                className="rounded-sm border border-white/20 px-3 py-1 text-xs disabled:opacity-40"
              >
                ↓
              </button>
              <Link
                href={`/admin/gallery/${image.id}/edit`}
                className="rounded-sm border border-white/20 px-3 py-1 text-xs hover:border-white/40"
              >
                Modifier
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (!confirm(`Supprimer « ${image.title} » de la galerie ?`)) return;
                  startTransition(async () => {
                    await deleteGalleryImage(image.id);
                    router.refresh();
                  });
                }}
                className="rounded-sm border border-red-500/30 px-3 py-1 text-xs text-red-200 hover:border-red-500/50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
