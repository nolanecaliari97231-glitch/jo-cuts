import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import GalleryEditForm from "@/components/admin/GalleryEditForm";
import AdminShell from "@/components/admin/AdminShell";
import PortfolioImage, { DEFAULT_PHOTO_FOCUS } from "@/components/PortfolioImage";
import { getGalleryImageById } from "@/lib/gallery-data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Modifier la photo",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const image = await getGalleryImageById(id);
  if (!image) notFound();

  return (
    <AdminShell title="Modifier la photo" description={image.title}>
      <div className="mb-8 max-w-xs overflow-hidden rounded-sm border border-white/10">
        <div className="relative aspect-square">
          <PortfolioImage
            src={image.url}
            alt={image.alt ?? image.title}
            focus={image.focus ?? DEFAULT_PHOTO_FOCUS}
          />
        </div>
      </div>

      <GalleryEditForm
        imageId={image.id}
        defaultValues={{
          title: image.title,
          alt: image.alt ?? "",
          focus: image.focus ?? DEFAULT_PHOTO_FOCUS,
        }}
      />
    </AdminShell>
  );
}
