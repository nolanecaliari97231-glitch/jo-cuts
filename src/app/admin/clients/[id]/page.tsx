import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ClientDetailPanel from "@/components/admin/ClientDetailPanel";
import AdminShell from "@/components/admin/AdminShell";
import { getClientAppointmentHistory, getClientProfileForStaff } from "@/lib/client-data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Fiche client",
  robots: { index: false, follow: false },
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const [client, history] = await Promise.all([
    getClientProfileForStaff(session.staffId, id),
    getClientAppointmentHistory(session.staffId, id),
  ]);

  if (!client) notFound();

  return (
    <AdminShell title="Fiche client" description={client.name}>
      <ClientDetailPanel client={client} history={history} />
    </AdminShell>
  );
}
