import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ServiceAdminList from "@/components/admin/ServiceAdminList";
import { getSession } from "@/lib/session";
import { getAllServices } from "@/lib/service-data";

export const metadata: Metadata = {
  title: "Services",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const services = await getAllServices();

  return (
    <AdminShell
      title="Services"
      description="Gérez vos prestations, tarifs et durées. Les services actifs apparaissent sur le site public."
    >
      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/services/new"
          className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90"
        >
          Nouveau service
        </Link>
      </div>

      <ServiceAdminList services={services} />
    </AdminShell>
  );
}
