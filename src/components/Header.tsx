"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/navigation";
import Logo from "./Logo";

function NavLink({
  href,
  label,
  isActive,
  onClick,
  mobile = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-medium transition-colors ${
        mobile
          ? `block py-3.5 text-base ${
              isActive
                ? "text-[var(--color-foreground)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`
          : `text-sm ${
              isActive
                ? "text-[var(--color-foreground)] underline decoration-[var(--color-accent)] decoration-2 underline-offset-8"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="group min-w-0 transition-opacity hover:opacity-90">
          <Logo variant="header" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} isActive={pathname === href} />
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm border border-white/10 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
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
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="fixed inset-x-0 top-[65px] z-50 max-h-[calc(100dvh-65px)] overflow-y-auto border-b border-white/10 bg-[var(--color-surface)] px-4 py-2 md:hidden"
            aria-label="Navigation mobile"
          >
            <div className="flex flex-col divide-y divide-white/5">
              {navLinks.map(({ href, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  isActive={pathname === href}
                  onClick={() => setMenuOpen(false)}
                  mobile
                />
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
