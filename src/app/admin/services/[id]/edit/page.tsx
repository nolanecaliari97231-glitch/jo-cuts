import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ServiceForm from "@/components/admin/ServiceForm";
import { getSession } from "@/lib/session";
import { getServiceById } from "@/lib/service-data";

export const metadata: Metadata = {
  title: "Modifier le service",
  robots: { index: false, follow: false },
};

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <AdminShell title="Modifier le service" description={service.name}>
      <ServiceForm
        action="update"
        serviceId={service.id}
        defaultValues={{
          name: service.name,
          description: service.description ?? "",
          durationMinutes: service.durationMinutes,
          price: Number.parseFloat(service.price.toString()),
          category: service.category,
          active: service.active,
        }}
      />
    </AdminShell>
  );
}
