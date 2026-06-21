import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { createService, updateService } from "@/app/admin/services/actions";

type ServiceFormProps = {
  action: "create" | "update";
  serviceId?: string;
  defaultValues?: {
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    category: string;
    active: boolean;
  };
};

export default function ServiceForm({ action, serviceId, defaultValues }: ServiceFormProps) {
  const formAction =
    action === "create"
      ? createService
      : updateService.bind(null, serviceId as string);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-[var(--color-muted)]">
          Nom du service
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm text-[var(--color-muted)]">
          Catégorie
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues?.category ?? SERVICE_CATEGORIES[0]}
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30"
        >
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm text-[var(--color-muted)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="durationMinutes" className="block text-sm text-[var(--color-muted)]">
            Durée (minutes)
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={5}
            step={5}
            required
            defaultValue={defaultValues?.durationMinutes ?? 30}
            className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm text-[var(--color-muted)]">
            Prix (€)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={defaultValues?.price ?? 0}
            className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
          className="h-4 w-4 rounded-sm border border-white/20 bg-[var(--color-surface)]"
        />
        Service actif (visible sur le site public)
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90"
        >
          {action === "create" ? "Créer le service" : "Enregistrer"}
        </button>
        <Link
          href="/admin/services"
          className="inline-flex items-center rounded-sm border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-white/40"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
