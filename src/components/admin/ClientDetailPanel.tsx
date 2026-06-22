"use client";

import Link from "next/link";
import { useTransition } from "react";
import { saveClientNotes } from "@/app/admin/clients/actions";
import type { ClientAppointmentHistoryItem, ClientProfile } from "@/lib/client-data";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS, formatLongDate, formatTime } from "@/lib/schedule";

export default function ClientDetailPanel({
  client,
  history,
}: {
  client: ClientProfile;
  history: ClientAppointmentHistoryItem[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">{client.name}</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Client depuis le {formatLongDate(client.createdAt)}
          </p>
        </div>
        <Link
          href="/admin/clients"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          Retour à la liste
        </Link>
      </div>

      <dl className="grid gap-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <DetailItem label="Téléphone" value={client.phone ?? "Non renseigné"} />
        <DetailItem label="Email" value={client.email ?? "Non renseigné"} />
        <DetailItem label="Rendez-vous" value={String(client.appointmentCount)} />
        <DetailItem label="Terminés" value={String(client.completedCount)} />
      </dl>

      <section className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
        <h3 className="font-serif text-xl">Notes internes</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Préférences, remarques personnelles — visibles uniquement dans le back-office.
        </p>
        <form
          action={(formData) => {
            startTransition(async () => {
              await saveClientNotes(client.id, formData);
            });
          }}
          className="mt-4 space-y-4"
        >
          <textarea
            name="notes"
            rows={4}
            defaultValue={client.notes ?? ""}
            placeholder='Ex. "Préfère le dégradé court", "Sensible au niveau des contours"…'
            className="w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] disabled:opacity-60"
          >
            {isPending ? "Enregistrement…" : "Enregistrer les notes"}
          </button>
        </form>
      </section>

      <section>
        <h3 className="font-serif text-xl">Historique des rendez-vous</h3>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">Aucun rendez-vous enregistré.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((appointment) => (
              <li
                key={appointment.id}
                className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-sm border px-2 py-0.5 text-xs ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
                      >
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </span>
                      <span className="text-sm font-medium">{appointment.service.name}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {formatLongDate(appointment.startTime)} · {formatTime(appointment.startTime)} –{" "}
                      {formatTime(appointment.endTime)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {appointment.locationMode === "at_home"
                        ? `À domicile${appointment.commune ? ` — ${appointment.commune}` : ""}`
                        : "Chez le barbier"}{" "}
                      · {appointment.service.price.toFixed(2)} €
                    </p>
                  </div>
                  <Link
                    href={`/admin/appointments/${appointment.id}`}
                    className="shrink-0 text-sm underline underline-offset-4 hover:text-[var(--color-foreground)]"
                  >
                    Voir le RDV
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
