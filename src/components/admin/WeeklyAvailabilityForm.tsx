"use client";

import { useTransition } from "react";
import { saveWeeklySchedule } from "@/app/admin/availability/actions";
import type { DaySchedule } from "@/lib/schedule";

export default function WeeklyAvailabilityForm({ schedules }: { schedules: DaySchedule[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await saveWeeklySchedule(formData);
        });
      }}
      className="space-y-4"
    >
      <div className="overflow-x-auto rounded-sm border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Jour</th>
              <th className="px-4 py-3 font-medium">Matin</th>
              <th className="px-4 py-3 font-medium">Après-midi</th>
              <th className="px-4 py-3 font-medium">Fermé</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.dayOfWeek} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{schedule.label}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name={`morningStart-${schedule.dayOfWeek}`}
                      defaultValue={schedule.morningStart}
                      className="rounded-sm border border-white/10 bg-[var(--color-background)] px-2 py-1"
                    />
                    <span className="text-[var(--color-muted)]">→</span>
                    <input
                      type="time"
                      name={`morningEnd-${schedule.dayOfWeek}`}
                      defaultValue={schedule.morningEnd}
                      className="rounded-sm border border-white/10 bg-[var(--color-background)] px-2 py-1"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name={`afternoonStart-${schedule.dayOfWeek}`}
                      defaultValue={schedule.afternoonStart}
                      className="rounded-sm border border-white/10 bg-[var(--color-background)] px-2 py-1"
                    />
                    <span className="text-[var(--color-muted)]">→</span>
                    <input
                      type="time"
                      name={`afternoonEnd-${schedule.dayOfWeek}`}
                      defaultValue={schedule.afternoonEnd}
                      className="rounded-sm border border-white/10 bg-[var(--color-background)] px-2 py-1"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    name={`closed-${schedule.dayOfWeek}`}
                    defaultChecked={schedule.closed}
                    className="h-4 w-4 rounded-sm border border-white/20 bg-[var(--color-surface)]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        Pause déjeuner entre les plages matin et après-midi. Les créneaux de rendez-vous seront
        calculés par intervalles de 30 minutes à partir de ces horaires.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Enregistrement…" : "Enregistrer les horaires"}
      </button>
    </form>
  );
}
