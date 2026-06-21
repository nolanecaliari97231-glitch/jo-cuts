"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="hidden items-center gap-4 lg:flex">
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

      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-white/10 lg:hidden"
        aria-expanded={menuOpen}
        aria-controls="admin-mobile-nav"
        aria-label={menuOpen ? "Fermer le menu admin" : "Ouvrir le menu admin"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="admin-mobile-nav"
            className="fixed inset-x-0 top-[57px] z-50 max-h-[calc(100dvh-57px)] overflow-y-auto border-b border-white/10 bg-[var(--color-surface)] px-4 py-4 lg:hidden"
            aria-label="Navigation admin mobile"
          >
            <div className="flex flex-col">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/5 py-3.5 text-sm font-medium text-[var(--color-foreground)]"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/5 py-3.5 text-sm text-[var(--color-muted)]"
              >
                Site public
              </Link>
              <div className="pt-4">
                <AdminLogoutButton />
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
