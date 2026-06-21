import Link from "next/link";
import type { ClientListItem } from "@/lib/client-data";
import { formatLongDate } from "@/lib/schedule";

export default function ClientAdminList({ clients }: { clients: ClientListItem[] }) {
  if (clients.length === 0) {
    return (
      <p className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        Aucun client pour l&apos;instant. Les fiches apparaissent après une première demande de
        rendez-vous.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {clients.map((client) => (
        <li
          key={client.id}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-medium">{client.name}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {client.phone}
                {client.email ? ` · ${client.email}` : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {client.appointmentCount} RDV
                {client.lastAppointmentAt && client.lastServiceName
                  ? ` · Dernier : ${client.lastServiceName} le ${formatLongDate(client.lastAppointmentAt)}`
                  : ""}
              </p>
              {client.notes && (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--color-muted)]">
                  Note : {client.notes}
                </p>
              )}
            </div>
            <Link
              href={`/admin/clients/${client.id}`}
              className="shrink-0 rounded-sm border border-white/20 px-4 py-2 text-sm hover:border-white/40"
            >
              Voir la fiche
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
