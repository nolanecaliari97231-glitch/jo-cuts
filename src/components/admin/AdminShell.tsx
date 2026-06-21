import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const navLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/appointments?status=pending", label: "Demandes" },
  { href: "/admin/calendar", label: "Calendrier" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/gallery", label: "Galerie" },
  { href: "/admin/availability", label: "Disponibilités" },
  { href: "/admin/services", label: "Services" },
];

export default function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <>
      <header className="border-b border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/admin" className="font-serif text-lg tracking-wide">
              JO&apos;Cuts Admin
            </Link>
            <nav className="flex flex-wrap gap-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              Site public
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="border-b border-white/10 pb-8">
          <h1 className="font-serif text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </>
  );
}
