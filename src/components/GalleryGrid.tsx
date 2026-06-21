import Link from "next/link";
import type { GalleryImage } from "@/lib/salon";
import PortfolioImage, { DEFAULT_PHOTO_FOCUS } from "./PortfolioImage";

interface GalleryGridProps {
  images: GalleryImage[];
  limit?: number;
  showLink?: boolean;
}

export default function GalleryGrid({ images, limit, showLink = false }: GalleryGridProps) {
  const items = limit ? images.slice(0, limit) : images;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <figure
            key={item.id ?? item.src}
            className="relative aspect-square overflow-hidden rounded-sm border border-white/10"
          >
            <PortfolioImage
              src={item.src}
              alt={item.alt}
              focus={item.focus ?? DEFAULT_PHOTO_FOCUS}
            />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10">
              <span className="text-xs font-medium text-white">{item.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {showLink && limit && images.length > limit && (
        <div className="mt-8 text-center">
          <Link
            href="/galerie"
            className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
          >
            Voir toute la galerie
          </Link>
        </div>
      )}
    </>
  );
}
