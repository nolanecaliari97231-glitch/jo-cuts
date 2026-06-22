"use client";

import { formatTimeDisplay, timeToMinutes } from "@/lib/schedule";

type BookingTimeSlotsProps = {
  slots: string[];
  selectedTime: string;
  onSelect: (time: string) => void;
};

const AFTERNOON_START = 12 * 60 + 30;

function groupSlots(slots: string[]) {
  const morning: string[] = [];
  const afternoon: string[] = [];

  for (const slot of slots) {
    if (timeToMinutes(slot) < AFTERNOON_START) {
      morning.push(slot);
    } else {
      afternoon.push(slot);
    }
  }

  return { morning, afternoon };
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: string;
  selected: boolean;
  onSelect: (time: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`inline-flex min-h-11 items-center justify-center rounded-sm border px-2 text-sm font-medium transition-colors ${
        selected
          ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-[var(--color-background)]"
          : "border-white/10 bg-[var(--color-surface)] hover:border-white/25"
      }`}
    >
      {formatTimeDisplay(slot)}
    </button>
  );
}

function SlotGroup({
  label,
  slots,
  selectedTime,
  onSelect,
}: {
  label: string;
  slots: string[];
  selectedTime: string;
  onSelect: (time: string) => void;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {slots.map((slot) => (
          <SlotButton key={slot} slot={slot} selected={selectedTime === slot} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function BookingTimeSlots({ slots, selectedTime, onSelect }: BookingTimeSlotsProps) {
  const { morning, afternoon } = groupSlots(slots);

  return (
    <div className="mt-3 space-y-4">
      <SlotGroup
        label="Matin"
        slots={morning}
        selectedTime={selectedTime}
        onSelect={onSelect}
      />
      <SlotGroup
        label="Après-midi"
        slots={afternoon}
        selectedTime={selectedTime}
        onSelect={onSelect}
      />
    </div>
  );
}
