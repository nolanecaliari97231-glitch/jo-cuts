import { salon } from "@/lib/salon";

export default function PaymentInfo() {
  return (
    <ul className="space-y-3">
      {salon.paymentMethods.map((method) => (
        <li
          key={method.id}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[var(--color-foreground)]">{method.label}</span>
            {method.available === false && (
              <span className="shrink-0 rounded-sm border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                Bientôt
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{method.description}</p>
        </li>
      ))}
    </ul>
  );
}
