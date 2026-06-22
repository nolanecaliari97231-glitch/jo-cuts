"use client";

import { formatTimeDisplay } from "@/lib/schedule";

type BookingTimeSlotsProps = {
  slots: string[];
  selectedTime: string;
  onSelect: (time: string) => void;
};

export default function BookingTimeSlots({ slots, selectedTime, onSelect }: BookingTimeSlotsProps) {
  return (
    <div className="mt-3 max-w-sm">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`inline-flex min-h-11 min-w-[4.5rem] shrink-0 items-center justify-center rounded-sm border px-3 text-sm font-medium transition-colors ${
              selectedTime === slot
                ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "border-white/10 bg-[var(--color-surface)] hover:border-white/25"
            }`}
          >
            {formatTimeDisplay(slot)}
          </button>
        ))}
      </div>
    </div>
  );
}
