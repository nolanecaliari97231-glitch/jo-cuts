import Link from "next/link";
import type { ClientListItem, DashboardTodayAppointment } from "@/lib/client-data";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS, formatTime } from "@/lib/schedule";

export function DashboardTodayList({
  appointments,
}: {
  appointments: DashboardTodayAppointment[];
}) {
  return (
    <section className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl">RDV du jour</h2>
        <Link
          href="/admin/calendar?view=day"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          Calendrier
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">Aucun rendez-vous prévu aujourd&apos;hui.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="flex flex-col gap-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/clients/${appointment.client.id}`}
                    className="font-medium hover:underline"
                  >
                    {appointment.client.name}
                  </Link>
                  <p className="text-sm text-[var(--color-muted)]">
                    {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)} ·{" "}
                    {appointment.service.name}
                  </p>
                </div>
                <span
                  className={`rounded-sm border px-2 py-0.5 text-xs ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
                >
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </span>
              </div>
              <Link
                href={`/admin/appointments/${appointment.id}`}
                className="text-xs text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
              >
                Gérer le RDV
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DashboardRecentClients({ clients }: { clients: ClientListItem[] }) {
  return (
    <section className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl">Clients récents</h2>
        <Link
          href="/admin/clients"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          Tous les clients
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          Les fiches clients apparaissent après une première demande.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {clients.map((client) => (
            <li key={client.id} className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <div>
                <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
                  {client.name}
                </Link>
                <p className="text-sm text-[var(--color-muted)]">
                  {client.phone} · {client.appointmentCount} RDV
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
