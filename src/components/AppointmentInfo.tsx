import { salon } from "@/lib/salon";

export default function AppointmentInfo() {
  return (
    <div className="space-y-4">
      {[salon.appointmentModes.atBarber, salon.appointmentModes.atHome].map((mode) => (
        <div
          key={mode.label}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-5"
        >
          <h3 className="font-medium text-[var(--color-foreground)]">{mode.label}</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{mode.description}</p>
        </div>
      ))}
      <p className="text-xs text-[var(--color-muted)]">{salon.locationPolicy}</p>
    </div>
  );
}
