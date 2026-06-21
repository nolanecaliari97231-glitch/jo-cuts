import type { OpeningHour } from "@/lib/salon";

interface OpeningHoursProps {
  hours: readonly OpeningHour[];
  compact?: boolean;
  note?: string;
}

export default function OpeningHours({ hours, compact = false, note }: OpeningHoursProps) {
  return (
    <div>
      <dl className={compact ? "space-y-2" : "space-y-3"}>
        {hours.map(({ day, hours: time, closed }) => (
          <div
            key={day}
            className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${compact ? "text-sm" : ""}`}
          >
            <dt className="text-[var(--color-foreground)]">{day}</dt>
            <dd className={`${closed ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"} sm:text-right`}>
              {time}
            </dd>
          </div>
        ))}
      </dl>
      {note && (
        <p className={`mt-4 text-[var(--color-muted)] ${compact ? "text-xs" : "text-sm"}`}>{note}</p>
      )}
    </div>
  );
}
