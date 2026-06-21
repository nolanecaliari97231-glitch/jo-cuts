import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import PageIntro from "@/components/PageIntro";
import { getPublicGalleryImages } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "Galerie",
};

export default async function GaleriePage() {
  const images = await getPublicGalleryImages();

  return (
    <>
      <PageIntro
        title="Galerie"
        description="Réalisations JO'Cuts — dégradés, line-ups, barbes, coupes enfant et designs sur mesure."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <GalleryGrid images={images} />
      </div>
    </>
  );
}
