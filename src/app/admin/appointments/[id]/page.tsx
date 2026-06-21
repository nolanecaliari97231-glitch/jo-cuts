import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AppointmentDetailPanel from "@/components/admin/AppointmentDetailPanel";
import AdminShell from "@/components/admin/AdminShell";
import { getStaffAppointmentById } from "@/lib/appointment-admin";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Détail du rendez-vous",
  robots: { index: false, follow: false },
};

export default async function AdminAppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string; refused?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const appointment = await getStaffAppointmentById(session.staffId, id);
  if (!appointment) notFound();

  const flash =
    query.confirmed === "1" ? "confirmed" : query.refused === "1" ? "refused" : undefined;

  return (
    <AdminShell title="Détail du rendez-vous" description={appointment.client.name}>
      <AppointmentDetailPanel appointment={appointment} flash={flash} />
    </AdminShell>
  );
}
