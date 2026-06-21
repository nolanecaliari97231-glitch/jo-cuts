"use client";

import { useMemo, useState } from "react";
import {
  formatDateKey,
  formatLongDate,
  getMonthGrid,
  getMonthStart,
} from "@/lib/schedule";

const WEEKDAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

type BookingDateCalendarProps = {
  bookableDates: string[];
  selectedDate: string;
  onSelect: (dateKey: string) => void;
};

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function BookingDateCalendar({
  bookableDates,
  selectedDate,
  onSelect,
}: BookingDateCalendarProps) {
  const bookableSet = useMemo(() => new Set(bookableDates), [bookableDates]);

  const bounds = useMemo(() => {
    if (bookableDates.length === 0) return null;
    const sorted = [...bookableDates].sort();
    return {
      first: parseDateKey(sorted[0]!),
      last: parseDateKey(sorted[sorted.length - 1]!),
    };
  }, [bookableDates]);

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) return getMonthStart(parseDateKey(selectedDate));
    if (bookableDates[0]) return getMonthStart(parseDateKey(bookableDates[0]));
    return getMonthStart(new Date());
  });

  const monthLabel = viewMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const grid = getMonthGrid(viewMonth);
  const currentMonth = viewMonth.getMonth();

  const canGoPrev =
    bounds &&
    getMonthStart(viewMonth).getTime() > getMonthStart(bounds.first).getTime();
  const canGoNext =
    bounds &&
    getMonthStart(viewMonth).getTime() < getMonthStart(bounds.last).getTime();

  function shiftMonth(delta: number) {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div className="mt-3 overflow-hidden rounded-sm border border-white/10 bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Mois précédent"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-white/10 text-sm transition-colors hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>
        <p className="font-serif text-base capitalize sm:text-lg">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoNext}
          aria-label="Mois suivant"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-white/10 text-sm transition-colors hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-30"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 px-2 py-2 sm:px-3">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)] sm:text-xs"
          >
            {label}
          </div>
        ))}

        {grid.map((day) => {
          const dateKey = formatDateKey(day);
          const inMonth = day.getMonth() === currentMonth;
          const isBookable = bookableSet.has(dateKey);
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === formatDateKey(new Date());

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isBookable}
              onClick={() => {
                onSelect(dateKey);
                if (day.getMonth() !== currentMonth) {
                  setViewMonth(getMonthStart(day));
                }
              }}
              aria-label={formatLongDate(day)}
              aria-pressed={isSelected}
              className={`relative flex aspect-square items-center justify-center rounded-sm text-sm transition-colors ${
                isSelected
                  ? "bg-[var(--color-foreground)] font-semibold text-[var(--color-background)]"
                  : isBookable
                    ? "text-[var(--color-foreground)] hover:bg-white/10"
                    : inMonth
                      ? "cursor-not-allowed text-[var(--color-muted)]/35"
                      : "cursor-not-allowed text-[var(--color-muted)]/20"
              } ${isToday && !isSelected ? "ring-1 ring-inset ring-white/25" : ""}`}
            >
              {day.getDate()}
              {isBookable && !isSelected && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-emerald-400/80" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div className="border-t border-white/10 px-4 py-3 text-sm text-[var(--color-muted)]">
          Date choisie :{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {formatLongDate(parseDateKey(selectedDate))}
          </span>
        </div>
      ) : (
        <div className="border-t border-white/10 px-4 py-3 text-sm text-[var(--color-muted)]">
          Les jours avec un point vert sont disponibles.
        </div>
      )}
    </div>
  );
}
