"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelAppointmentAction,
  completeAppointmentAction,
  confirmAppointmentAction,
  refuseAppointmentAction,
} from "@/app/admin/appointments/actions";
import type { AdminAppointment } from "@/lib/appointment-admin";
import { privateSalonLocation, salon } from "@/lib/salon";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS, formatLongDate, formatTime } from "@/lib/schedule";

function paymentLabel(method: string | null): string {
  return salon.paymentMethods.find((item) => item.id === method)?.label ?? method ?? "—";
}

export default function AppointmentDetailPanel({
  appointment,
  flash,
}: {
  appointment: AdminAppointment;
  flash?: "confirmed" | "refused";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {flash === "confirmed" && (
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Rendez-vous confirmé.{" "}
          {appointment.client.email
            ? "Un email a été envoyé au client."
            : "Le client n'a pas d'email — contactez-le par téléphone."}
        </div>
      )}
      {flash === "refused" && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Demande refusée.{" "}
          {appointment.client.email
            ? "Un email a été envoyé au client."
            : "Le client n'a pas d'email — contactez-le par téléphone."}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex rounded-sm border px-2 py-1 text-xs ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
          >
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </span>
          <h2 className="mt-4 font-serif text-2xl">
            <Link
              href={`/admin/clients/${appointment.client.id}`}
              className="hover:underline"
            >
              {appointment.client.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Demande reçue le {formatLongDate(appointment.createdAt)}
          </p>
        </div>
        <Link
          href="/admin/appointments"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          Retour à la liste
        </Link>
      </div>

      <dl className="grid gap-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm sm:grid-cols-2">
        <DetailItem label="Prestation" value={appointment.service.name} />
        <DetailItem
          label="Tarif"
          value={`${appointment.service.price.toFixed(2)} € · ${appointment.service.durationMinutes} min`}
        />
        <DetailItem label="Date" value={formatLongDate(appointment.startTime)} />
        <DetailItem
          label="Heure"
          value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`}
        />
        <DetailItem
          label="Lieu"
          value={
            appointment.locationMode === "at_home"
              ? `À domicile${appointment.commune ? ` — ${appointment.commune}` : ""}`
              : "Chez le barbier"
          }
        />
        <DetailItem label="Paiement prévu" value={paymentLabel(appointment.paymentMethod)} />
        <DetailItem label="Téléphone" value={appointment.client.phone ?? "Non renseigné"} />
        <DetailItem label="Email" value={appointment.client.email ?? "Non renseigné"} />
        {appointment.travelSupplement != null && (
          <DetailItem
            label="Supplément déplacement"
            value={`${appointment.travelSupplement.toFixed(2)} €`}
          />
        )}
        {appointment.staffMessage && (
          <DetailItem label="Message barbier" value={appointment.staffMessage} className="sm:col-span-2" />
        )}
        {appointment.notes && (
          <DetailItem label="Notes client" value={appointment.notes} className="sm:col-span-2" />
        )}
      </dl>

      {appointment.status === "confirmed" && appointment.locationMode === "at_barber" && (
        <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm">
          <h3 className="font-medium">Adresse (chez le barbier)</h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Le client reçoit l&apos;adresse dans son espace Mon compte (message automatique) et par
            email si Resend est configuré.
          </p>
          <a
            href={privateSalonLocation.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block underline underline-offset-4 hover:text-[var(--color-foreground)]"
          >
            Ouvrir Google Maps
          </a>
        </div>
      )}

      {appointment.status === "pending" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ActionCard title="Confirmer le rendez-vous">
            <form
              action={(formData) => {
                startTransition(async () => {
                  setError(null);
                  const result = await confirmAppointmentAction(appointment.id, formData);
                  if (result?.error) setError(result.error);
                });
              }}
              className="space-y-4"
            >
              {appointment.locationMode === "at_home" && (
                <Field label="Supplément déplacement (€) *">
                  <input
                    name="travelSupplement"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    className={inputClassName}
                    placeholder="Ex. 10"
                  />
                </Field>
              )}
              <Field label="Message au client (optionnel)">
                <textarea
                  name="staffMessage"
                  rows={3}
                  className={inputClassName}
                  placeholder="Instructions, adresse complémentaire…"
                />
              </Field>
              <SubmitButton pending={isPending} label="Confirmer" />
            </form>
          </ActionCard>

          <ActionCard title="Refuser la demande">
            <form
              action={(formData) => {
                startTransition(async () => {
                  setError(null);
                  const result = await refuseAppointmentAction(appointment.id, formData);
                  if (result?.error) setError(result.error);
                });
              }}
              className="space-y-4"
            >
              <Field label="Message au client (optionnel)">
                <textarea
                  name="staffMessage"
                  rows={3}
                  className={inputClassName}
                  placeholder="Proposez un autre créneau, précisez la raison…"
                />
              </Field>
              <SubmitButton pending={isPending} label="Refuser" variant="danger" />
            </form>
          </ActionCard>
        </div>
      )}

      {["pending", "confirmed"].includes(appointment.status) && (
        <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
          {appointment.status === "confirmed" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  setError(null);
                  const result = await completeAppointmentAction(appointment.id);
                  if (result?.error) {
                    setError(result.error);
                    return;
                  }
                  router.refresh();
                });
              }}
              className="rounded-sm border border-white/20 px-4 py-2 text-sm hover:border-white/40 disabled:opacity-60"
            >
              Marquer comme terminé
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Annuler ce rendez-vous ?")) return;
              startTransition(async () => {
                setError(null);
                const result = await cancelAppointmentAction(appointment.id);
                if (result?.error) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              });
            }}
            className="rounded-sm border border-red-500/30 px-4 py-2 text-sm text-red-200 hover:border-red-500/50 disabled:opacity-60"
          >
            Annuler le rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}

const inputClassName =
  "mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-white/30";

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function ActionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
      <h3 className="font-serif text-xl">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-[var(--color-muted)]">
      {label}
      {children}
    </label>
  );
}

function SubmitButton({
  pending,
  label,
  variant = "primary",
}: {
  pending: boolean;
  label: string;
  variant?: "primary" | "danger";
}) {
  const classes =
    variant === "danger"
      ? "border border-red-500/40 text-red-100 hover:border-red-500/60"
      : "bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center rounded-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-wider disabled:opacity-60 ${classes}`}
    >
      {pending ? "Traitement…" : label}
    </button>
  );
}
