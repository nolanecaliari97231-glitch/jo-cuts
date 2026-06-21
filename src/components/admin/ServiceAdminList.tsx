"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteService, toggleServiceActive } from "@/app/admin/services/actions";
import type { DbService } from "@/lib/service-data";

export default function ServiceAdminList({ services }: { services: DbService[] }) {
  const router = useRouter();

  async function handleToggle(id: string) {
    await toggleServiceActive(id);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Supprimer « ${name} » ?`)) return;

    const result = await deleteService(id);
    if (result?.error) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  if (services.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-white/20 p-8 text-center text-sm text-[var(--color-muted)]">
        Aucun service pour l&apos;instant. Créez votre première prestation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <article
          key={service.id}
          className="rounded-sm border border-white/10 bg-[var(--color-surface)] p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{service.name}</h2>
                <span className="rounded-sm border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                  {service.category}
                </span>
                {!service.active && (
                  <span className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200">
                    Inactif
                  </span>
                )}
              </div>
              {service.description && (
                <p className="mt-2 text-sm text-[var(--color-muted)]">{service.description}</p>
              )}
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {service.durationMinutes} min — {service.price.toFixed(2)} €
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/services/${service.id}/edit`}
                className="rounded-sm border border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-white/40"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleToggle(service.id)}
                className="rounded-sm border border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-white/40"
              >
                {service.active ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(service.id, service.name)}
                className="rounded-sm border border-red-500/30 px-3 py-1.5 text-sm text-red-200 transition-colors hover:border-red-500/50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
