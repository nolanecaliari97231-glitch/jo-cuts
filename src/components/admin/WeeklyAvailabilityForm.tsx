"use client";

import { useTransition } from "react";
import { saveWeeklySchedule } from "@/app/admin/availability/actions";
import type { DaySchedule } from "@/lib/schedule";

const timeInputClassName =
  "w-full min-h-11 rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-base sm:text-sm";

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
      <div className="space-y-4 md:hidden">
        {schedules.map((schedule) => (
          <div
            key={schedule.dayOfWeek}
            className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium">{schedule.label}</p>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <input
                  type="checkbox"
                  name={`closed-${schedule.dayOfWeek}`}
                  defaultChecked={schedule.closed}
                  className="h-5 w-5 rounded-sm border border-white/20 bg-[var(--color-surface)]"
                />
                Fermé
              </label>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                  Matin
                </p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="time"
                    name={`morningStart-${schedule.dayOfWeek}`}
                    defaultValue={schedule.morningStart}
                    className={timeInputClassName}
                  />
                  <span className="text-[var(--color-muted)]">→</span>
                  <input
                    type="time"
                    name={`morningEnd-${schedule.dayOfWeek}`}
                    defaultValue={schedule.morningEnd}
                    className={timeInputClassName}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                  Après-midi
                </p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="time"
                    name={`afternoonStart-${schedule.dayOfWeek}`}
                    defaultValue={schedule.afternoonStart}
                    className={timeInputClassName}
                  />
                  <span className="text-[var(--color-muted)]">→</span>
                  <input
                    type="time"
                    name={`afternoonEnd-${schedule.dayOfWeek}`}
                    defaultValue={schedule.afternoonEnd}
                    className={timeInputClassName}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-sm border border-white/10 md:block">
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
                      className="min-h-10 rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2"
                    />
                    <span className="text-[var(--color-muted)]">→</span>
                    <input
                      type="time"
                      name={`morningEnd-${schedule.dayOfWeek}`}
                      defaultValue={schedule.morningEnd}
                      className="min-h-10 rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name={`afternoonStart-${schedule.dayOfWeek}`}
                      defaultValue={schedule.afternoonStart}
                      className="min-h-10 rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2"
                    />
                    <span className="text-[var(--color-muted)]">→</span>
                    <input
                      type="time"
                      name={`afternoonEnd-${schedule.dayOfWeek}`}
                      defaultValue={schedule.afternoonEnd}
                      className="min-h-10 rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2"
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
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Enregistrement…" : "Enregistrer les horaires"}
      </button>
    </form>
  );
}
