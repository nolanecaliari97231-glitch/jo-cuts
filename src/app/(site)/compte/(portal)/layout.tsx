import Link from "next/link";
import { redirect } from "next/navigation";
import ClientLogoutButton from "@/components/client/ClientLogoutButton";
import { getClientSession } from "@/lib/client-session";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();
  if (!session) {
    redirect("/compte/connexion");
  }

  return (
    <div>
      <div className="border-b border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/compte" className="text-sm font-medium">
              Mon compte
            </Link>
            <Link
              href="/rendez-vous"
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              Prendre RDV
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <span className="max-w-[12rem] truncate">{session.name}</span>
            <ClientLogoutButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
