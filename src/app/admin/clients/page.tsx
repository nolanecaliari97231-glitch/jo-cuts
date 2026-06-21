import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ClientAdminList from "@/components/admin/ClientAdminList";
import AdminShell from "@/components/admin/AdminShell";
import { getClientsForStaff } from "@/lib/client-data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Clients",
  robots: { index: false, follow: false },
};

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const clients = await getClientsForStaff(session.staffId, search);

  return (
    <AdminShell
      title="Clients"
      description="Fiches clients, notes internes et historique des rendez-vous."
    >
      <form className="mb-8">
        <label htmlFor="q" className="sr-only">
          Rechercher un client
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Nom, téléphone ou email…"
            className="w-full rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-white/30 sm:max-w-md"
          />
          <button
            type="submit"
            className="rounded-sm border border-white/20 px-5 py-2 text-sm hover:border-white/40"
          >
            Rechercher
          </button>
          {search && (
            <Link
              href="/admin/clients"
              className="inline-flex items-center px-2 text-sm text-[var(--color-muted)] underline underline-offset-4"
            >
              Effacer
            </Link>
          )}
        </div>
      </form>

      <p className="mb-4 text-sm text-[var(--color-muted)]">
        {clients.length} client{clients.length > 1 ? "s" : ""}
        {search ? ` pour « ${search} »` : ""}
      </p>

      <ClientAdminList clients={clients} />
    </AdminShell>
  );
}
