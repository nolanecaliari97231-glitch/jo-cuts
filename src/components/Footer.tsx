import Link from "next/link";
import { navLinks } from "@/lib/navigation";
import type { OpeningHour } from "@/lib/salon";
import { salon } from "@/lib/salon";
import Logo from "./Logo";
import OpeningHours from "./OpeningHours";
import SocialLinks from "./SocialLinks";

export default function Footer({ openingHours }: { openingHours: OpeningHour[] }) {
  return (
    <footer className="border-t border-white/10 bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo variant="header" className="scale-90 origin-left" />
          <p className="mt-4 max-w-sm text-sm text-[var(--color-muted)]">{salon.pitch}</p>
          <SocialLinks className="mt-5" />
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Navigation
          </h2>
          <ul className="mt-4 space-y-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Horaires
          </h2>
          <div className="mt-4">
            <OpeningHours hours={openingHours} compact note={salon.openingHoursNote} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[var(--color-muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            <span>{salon.region}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <a href={salon.phoneHref} className="hover:text-[var(--color-foreground)]">
              {salon.phone}
            </a>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <a
              href={salon.emailHref}
              className="break-all hover:text-[var(--color-foreground)] sm:break-normal"
            >
              {salon.email}
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} JO&apos;Cuts. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
