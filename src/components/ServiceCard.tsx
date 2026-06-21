import type { ServiceItem } from "@/lib/salon";

interface ServiceCardProps {
  service: ServiceItem;
  showDescription?: boolean;
}

export default function ServiceCard({ service, showDescription = true }: ServiceCardProps) {
  return (
    <article className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium">{service.name}</h3>
        <span className="shrink-0 font-serif text-lg">{service.price} €</span>
      </div>
      {showDescription && (
        <p className="mt-2 text-sm text-[var(--color-muted)]">{service.description}</p>
      )}
      <p className="mt-4 text-xs uppercase tracking-wider text-[var(--color-muted)]">
        {service.duration}
      </p>
    </article>
  );
}
