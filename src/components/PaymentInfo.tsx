import { salon } from "@/lib/salon";

export default function PaymentInfo() {
  return (
    <ul className="space-y-3">
      {salon.paymentMethods.map((method) => (
        <li
          key={method.id}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-4"
        >
          <span className="font-medium text-[var(--color-foreground)]">{method.label}</span>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{method.description}</p>
        </li>
      ))}
    </ul>
  );
}
