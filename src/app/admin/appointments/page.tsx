import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppointmentAdminList from "@/components/admin/AppointmentAdminList";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminAppointment } from "@/lib/appointment-admin";
import { getPendingAppointments, getStaffAppointments } from "@/lib/appointment-admin";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Demandes de RDV",
  robots: { index: false, follow: false },
};

const FILTERS: { id: AdminAppointment["status"] | "all" | "pending"; label: string }[] = [
  { id: "pending", label: "En attente" },
  { id: "confirmed", label: "Confirmés" },
  { id: "completed", label: "Terminés" },
  { id: "refused", label: "Refusés" },
  { id: "cancelled", label: "Annulés" },
  { id: "all", label: "Tous" },
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const statusParam = params.status ?? "pending";
  const status = FILTERS.some((filter) => filter.id === statusParam)
    ? (statusParam as AdminAppointment["status"] | "all")
    : "pending";

  const [appointments, pendingAppointments] = await Promise.all([
    getStaffAppointments(session.staffId, status),
    getPendingAppointments(session.staffId),
  ]);

  return (
    <AdminShell
      title="Demandes de rendez-vous"
      description="Validez, refusez ou suivez les demandes clients. Les notifications email partent automatiquement si Resend est configuré."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/calendar"
          className="inline-flex items-center rounded-sm border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/40"
        >
          Calendrier
        </Link>
      </div>

      {pendingAppointments.length > 0 && status !== "pending" && (
        <div className="mb-6 rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {pendingAppointments.length} demande{pendingAppointments.length > 1 ? "s" : ""} en attente
          de validation.{" "}
          <Link href="/admin/appointments?status=pending" className="underline underline-offset-4">
            Voir
          </Link>
        </div>
      )}

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={`/admin/appointments?status=${filter.id}`}
            className={`shrink-0 rounded-sm px-4 py-2.5 text-sm ${
              status === filter.id
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "border border-white/20 hover:border-white/40"
            }`}
          >
            {filter.label}
            {filter.id === "pending" && pendingAppointments.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs">
                {pendingAppointments.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      <AppointmentAdminList
        appointments={appointments}
        showQuickActions={status === "pending"}
      />
    </AdminShell>
  );
}
