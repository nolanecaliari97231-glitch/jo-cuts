import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="shrink-0 font-serif text-lg tracking-wide">
            JO&apos;Cuts Admin
          </Link>

          <div className="flex items-center gap-3">
            <AdminMobileNav />
            <div className="hidden items-center gap-4 lg:flex">
              <Link
                href="/"
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                Site public
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="border-b border-white/10 pb-6 sm:pb-8">
          <h1 className="font-serif text-2xl sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
          )}
        </div>
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </>
  );
}
