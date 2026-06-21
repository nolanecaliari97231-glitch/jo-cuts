import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import GalleryAdminList from "@/components/admin/GalleryAdminList";
import GalleryUploadForm from "@/components/admin/GalleryUploadForm";
import AdminShell from "@/components/admin/AdminShell";
import { getAllGalleryImages } from "@/lib/gallery-data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Galerie",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const images = await getAllGalleryImages();

  return (
    <AdminShell
      title="Galerie"
      description="Ajoutez, réordonnez ou supprimez les photos visibles sur le site public."
    >
      <div className="mb-8">
        <Link
          href="/galerie"
          target="_blank"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          Voir la galerie publique
        </Link>
      </div>

      <GalleryUploadForm />

      <section className="mt-12">
        <h2 className="font-serif text-xl">Photos publiées ({images.length})</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Utilisez les flèches pour modifier l&apos;ordre d&apos;affichage.
        </p>
        <div className="mt-6">
          <GalleryAdminList images={images} />
        </div>
      </section>
    </AdminShell>
  );
}
