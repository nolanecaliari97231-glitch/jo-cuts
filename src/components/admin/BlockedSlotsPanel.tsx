"use client";

import { useTransition } from "react";
import { createBlockedSlot, deleteBlockedSlot } from "@/app/admin/availability/actions";
import type { DbBlockedSlot } from "@/lib/availability-data";
import { formatLongDate, formatTime } from "@/lib/schedule";

function defaultDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BlockedSlotsPanel({ slots }: { slots: DbBlockedSlot[] }) {
  const [isPending, startTransition] = useTransition();
  const today = defaultDateValue(new Date());

  return (
    <div className="space-y-8">
      <form
        action={(formData) => {
          startTransition(async () => {
            await createBlockedSlot(formData);
          });
        }}
        className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6"
      >
        <h2 className="font-serif text-xl">Bloquer un créneau</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Congés, rendez-vous perso, jour férié… Les créneaux bloqués ne seront pas proposés aux
          clients.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm text-[var(--color-muted)]">
              Début — date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm text-[var(--color-muted)]">
              Début — heure
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue="07:00"
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm text-[var(--color-muted)]">
              Fin — date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm text-[var(--color-muted)]">
              Fin — heure
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue="17:00"
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="reason" className="block text-sm text-[var(--color-muted)]">
            Motif (optionnel)
          </label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="Ex. Congés, RDV médical…"
            className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 inline-flex items-center rounded-sm border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-white/40 disabled:opacity-60"
        >
          Ajouter le blocage
        </button>
      </form>

      <div>
        <h2 className="font-serif text-xl">Blocages à venir</h2>
        {slots.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">Aucun créneau bloqué pour l&apos;instant.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-col gap-3 rounded-sm border border-white/10 bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {formatLongDate(slot.startDatetime)} · {formatTime(slot.startDatetime)} →{" "}
                    {formatTime(slot.endDatetime)}
                  </p>
                  {slot.reason && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{slot.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await deleteBlockedSlot(slot.id);
                    });
                  }}
                  className="text-sm text-red-300 transition-colors hover:text-red-200 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
