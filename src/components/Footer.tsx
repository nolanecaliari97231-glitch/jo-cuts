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
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
          <p>
            {salon.region} — {salon.phone} — {salon.email}
          </p>
          <p>&copy; {new Date().getFullYear()} JO&apos;Cuts. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
