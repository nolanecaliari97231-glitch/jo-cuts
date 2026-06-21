import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ServiceForm from "@/components/admin/ServiceForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Nouveau service",
  robots: { index: false, follow: false },
};

export default async function NewServicePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell title="Nouveau service" description="Ajoutez une prestation visible sur le site.">
      <ServiceForm action="create" />
    </AdminShell>
  );
}
