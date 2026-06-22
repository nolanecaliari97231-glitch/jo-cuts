import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { getClientAppointments, statusLabel } from "@/lib/client-portal";
import { getClientSession } from "@/lib/client-session";
import { formatLongDate, formatTime } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function ClientAccountPage() {
  const session = await getClientSession();
  if (!session) return null;

  const appointments = await getClientAppointments(session.clientId);

  return (
    <>
      <PageIntro
        title={`Bonjour ${session.name.split(" ")[0] ?? session.name}`}
        description="Vos rendez-vous et les messages du barbier apparaissent ici dès qu'une demande est traitée."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/rendez-vous"
            className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-foreground)] px-5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)]"
          >
            Nouveau rendez-vous
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
            Aucun rendez-vous pour l&apos;instant.{" "}
            <Link href="/rendez-vous" className="underline underline-offset-4">
              Prendre votre premier RDV
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <Link
                  href={`/compte/rendez-vous/${appointment.id}`}
                  className="block rounded-sm border border-white/10 bg-[var(--color-surface)] p-4 transition-colors hover:border-white/25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{appointment.service.name}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {formatLongDate(appointment.startTime)} · {formatTime(appointment.startTime)}
                      </p>
                    </div>
                    <span className="rounded-sm border border-white/15 px-2 py-1 text-xs uppercase tracking-wider">
                      {statusLabel(appointment.status)}
                    </span>
                  </div>
                  {appointment.messageCount > 0 && (
                    <p className="mt-3 text-xs text-emerald-200/80">
                      {appointment.messageCount} message{appointment.messageCount > 1 ? "s" : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
