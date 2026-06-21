"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { quickConfirmAppointment } from "@/app/admin/appointments/actions";
import type { AdminAppointment } from "@/lib/appointment-admin";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS, formatLongDate, formatTime } from "@/lib/schedule";

export default function AppointmentAdminList({
  appointments,
  showQuickActions = false,
}: {
  appointments: AdminAppointment[];
  showQuickActions?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (appointments.length === 0) {
    return (
      <p className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        Aucun rendez-vous dans cette catégorie.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {appointments.map((appointment) => (
        <li
          key={appointment.id}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-sm border px-2 py-0.5 text-xs ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}
                >
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </span>
                {appointment.locationMode === "at_home" && (
                  <span className="text-xs text-[var(--color-muted)]">À domicile</span>
                )}
              </div>
              <h2 className="mt-2 font-medium">
                <Link href={`/admin/clients/${appointment.client.id}`} className="hover:underline">
                  {appointment.client.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {appointment.service.name} — {formatLongDate(appointment.startTime)} à{" "}
                {formatTime(appointment.startTime)}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {appointment.client.phone}
                {appointment.commune ? ` · ${appointment.commune}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/appointments/${appointment.id}`}
                className="rounded-sm border border-white/20 px-4 py-2 text-sm hover:border-white/40"
              >
                Voir le détail
              </Link>
              {showQuickActions && appointment.status === "pending" && (
                <button
                  type="button"
                  disabled={isPending || appointment.locationMode === "at_home"}
                  title={
                    appointment.locationMode === "at_home"
                      ? "Fixez le supplément déplacement depuis le détail"
                      : undefined
                  }
                  onClick={() => {
                    startTransition(async () => {
                      const result = await quickConfirmAppointment(appointment.id);
                      if (!result?.error) router.refresh();
                    });
                  }}
                  className="rounded-sm bg-[var(--color-foreground)] px-4 py-2 text-sm font-medium text-[var(--color-background)] disabled:opacity-50"
                >
                  Confirmer
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
