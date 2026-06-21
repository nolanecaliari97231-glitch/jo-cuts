import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardRecentClients, DashboardTodayList } from "@/components/admin/DashboardPanels";
import AdminShell from "@/components/admin/AdminShell";
import {
  getPendingAppointmentCount,
  getTodayAppointmentCount,
} from "@/lib/availability-data";
import {
  getClientCountForStaff,
  getRecentClients,
  getTodayAppointmentsForStaff,
} from "@/lib/client-data";
import { getSession } from "@/lib/session";
import { getActiveServiceCount } from "@/lib/service-data";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [
    activeServices,
    pendingAppointments,
    todayAppointmentsCount,
    clientCount,
    todayAppointments,
    recentClients,
  ] = await Promise.all([
    getActiveServiceCount(),
    getPendingAppointmentCount(session.staffId),
    getTodayAppointmentCount(session.staffId),
    getClientCountForStaff(session.staffId),
    getTodayAppointmentsForStaff(session.staffId),
    getRecentClients(session.staffId, 5),
  ]);

  return (
    <AdminShell
      title={`Bonjour, ${session.name}`}
      description={session.email}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Demandes en attente",
            value: String(pendingAppointments),
            note: "À valider",
            href: "/admin/appointments?status=pending",
          },
          {
            title: "RDV du jour",
            value: String(todayAppointmentsCount),
            note: "Confirmés et en attente",
            href: "/admin/calendar?view=day",
          },
          {
            title: "Clients",
            value: String(clientCount),
            note: "Fiches avec historique",
            href: "/admin/clients",
          },
          {
            title: "Services actifs",
            value: String(activeServices),
            note: "Tarifs et durées",
            href: "/admin/services",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6"
          >
            <h2 className="text-sm text-[var(--color-muted)]">{card.title}</h2>
            <p className="mt-3 font-serif text-4xl">{card.value}</p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{card.note}</p>
            {card.href && (
              <Link
                href={card.href}
                className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-[var(--color-foreground)]"
              >
                Ouvrir
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <DashboardTodayList appointments={todayAppointments} />
        <DashboardRecentClients clients={recentClients} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/appointments?status=pending", title: "Demandes RDV", desc: "Valider ou refuser" },
          { href: "/admin/calendar", title: "Calendrier", desc: "Vue jour, semaine, mois" },
          { href: "/admin/clients", title: "Clients", desc: "Notes et historique" },
          { href: "/admin/gallery", title: "Galerie", desc: "Photos du site" },
          { href: "/admin/availability", title: "Disponibilités", desc: "Horaires et blocages" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 transition-colors hover:border-white/20"
          >
            <h2 className="font-serif text-xl">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-white/20 p-6">
        <h2 className="font-serif text-xl">Prochaines fonctionnalités</h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
          <li>• Espace client (V2)</li>
        </ul>
      </div>
    </AdminShell>
  );
}
