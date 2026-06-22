export function CalendarSkeleton() {
  return (
    <div className="mt-3 mx-auto max-w-sm animate-pulse overflow-hidden rounded-sm border border-white/10 bg-[var(--color-surface)]">
      <div className="border-b border-white/10 px-3 py-3">
        <div className="mx-auto h-4 w-28 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-2 py-2 sm:px-3">
        {Array.from({ length: 35 }, (_, index) => (
          <div key={index} className="mx-auto h-8 w-8 rounded-sm bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function TimeSlotsSkeleton() {
  return (
    <div className="mt-3 animate-pulse space-y-4">
      <div>
        <div className="mb-2 h-3 w-12 rounded bg-white/10" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="h-11 rounded-sm bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
