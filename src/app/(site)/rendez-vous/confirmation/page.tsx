import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/PageIntro";
import { getBookingConfirmation } from "@/lib/appointment-data";
import { salon } from "@/lib/salon";
import { formatLongDate, formatTime } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Demande envoyée",
};

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const appointment = await getBookingConfirmation(id);
  if (!appointment) notFound();

  const locationLabel =
    appointment.locationMode === "at_home"
      ? `À domicile${appointment.commune ? ` — ${appointment.commune}` : ""}`
      : "Chez le barbier";

  const paymentLabel =
    salon.paymentMethods.find((method) => method.id === appointment.paymentMethod)?.label ??
    appointment.paymentMethod;

  return (
    <>
      <PageIntro
        title="Demande envoyée"
        description="Votre demande de rendez-vous a bien été transmise au barbier."
      />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="font-medium text-emerald-100">En attente de validation</p>
          <p className="mt-2 text-sm text-emerald-50/80">
            Le barbier va valider votre demande. Vous recevrez une confirmation par email si vous
            en avez renseigné un. En cas d&apos;urgence, appelez le{" "}
            <a href={salon.phoneHref} className="underline underline-offset-4">
              {salon.phone}
            </a>
            .
          </p>
        </div>

        <dl className="mt-8 space-y-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Prestation</dt>
            <dd className="text-right font-medium">{appointment.service.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Date</dt>
            <dd className="text-right">{formatLongDate(appointment.startTime)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Heure</dt>
            <dd className="text-right">
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Lieu</dt>
            <dd className="text-right">{locationLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Paiement prévu</dt>
            <dd className="text-right">{paymentLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted)]">Contact</dt>
            <dd className="text-right">
              {appointment.client.name}
              <br />
              {appointment.client.phone}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)]"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/rendez-vous"
            className="inline-flex items-center rounded-sm border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-white/40"
          >
            Nouveau rendez-vous
          </Link>
        </div>
      </div>
    </>
  );
}
