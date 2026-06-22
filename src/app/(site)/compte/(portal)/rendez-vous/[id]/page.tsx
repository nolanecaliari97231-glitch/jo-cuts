import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/PageIntro";
import { getClientAppointmentById } from "@/lib/client-portal";
import { getClientSession } from "@/lib/client-session";
import { salon } from "@/lib/salon";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/schedule";
import { formatLongDate, formatTime } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Détail rendez-vous",
  robots: { index: false, follow: false },
};

function paymentLabel(method: string | null): string {
  return salon.paymentMethods.find((item) => item.id === method)?.label ?? method ?? "—";
}

export default async function ClientAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getClientSession();
  if (!session) return null;

  const { id } = await params;
  const appointment = await getClientAppointmentById(session.clientId, id);
  if (!appointment) notFound();

  const locationLabel =
    appointment.locationMode === "at_home"
      ? `À domicile${appointment.commune ? ` — ${appointment.commune}` : ""}`
      : "Chez le barbier";

  return (
    <>
      <PageIntro
        title={appointment.service.name}
        description={`${APPOINTMENT_STATUS_LABELS[appointment.status]} — ${formatLongDate(appointment.startTime)}`}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/compte"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)]"
        >
          ← Retour à mon compte
        </Link>

        <dl className="mt-6 space-y-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-5 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--color-muted)]">Statut</dt>
            <dd className="font-medium">{APPOINTMENT_STATUS_LABELS[appointment.status]}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--color-muted)]">Date</dt>
            <dd>{formatLongDate(appointment.startTime)}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--color-muted)]">Heure</dt>
            <dd>
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--color-muted)]">Lieu</dt>
            <dd>{locationLabel}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--color-muted)]">Paiement</dt>
            <dd>{paymentLabel(appointment.paymentMethod)}</dd>
          </div>
        </dl>

        {appointment.messages.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl">Messages</h2>
            <ul className="mt-4 space-y-3">
              {appointment.messages.map((message) => (
                <li
                  key={message.id}
                  className={`rounded-sm border p-4 text-sm whitespace-pre-wrap ${
                    message.sender === "system"
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : message.sender === "staff"
                        ? "border-white/10 bg-[var(--color-surface)]"
                        : "border-white/10 bg-[var(--color-background)]"
                  }`}
                >
                  <p className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                    {message.sender === "system"
                      ? "Confirmation JO'Cuts"
                      : message.sender === "staff"
                        ? "Barbier"
                        : "Vous"}
                  </p>
                  {message.body.includes("https://") ? (
                    <MessageBody body={message.body} />
                  ) : (
                    message.body
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {appointment.status === "pending" && (
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Votre demande est en attente. Vous serez notifié ici dès que le barbier l&apos;aura
            traitée.
          </p>
        )}
      </div>
    </>
  );
}

function MessageBody({ body }: { body: string }) {
  const parts = body.split(/(https:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("https://") ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline underline-offset-4"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
