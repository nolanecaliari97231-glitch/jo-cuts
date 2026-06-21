import Link from "next/link";
import AppointmentInfo from "./AppointmentInfo";
import OpeningHours from "./OpeningHours";
import PaymentInfo from "./PaymentInfo";
import SocialLinks from "./SocialLinks";
import { getPublicOpeningHours } from "@/lib/availability-data";
import { salon } from "@/lib/salon";

export default async function SalonInfo() {
  const openingHours = await getPublicOpeningHours();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Téléphone
        </h2>
        <a
          href={salon.phoneHref}
          className="mt-2 inline-block text-lg hover:text-[var(--color-foreground)]"
        >
          {salon.phone}
        </a>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Email
        </h2>
        <a
          href={salon.emailHref}
          className="mt-2 inline-block break-all hover:text-[var(--color-foreground)]"
        >
          {salon.email}
        </a>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Zone
        </h2>
        <p className="mt-2 text-[var(--color-foreground)]">{salon.region}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{salon.locationPolicy}</p>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Rendez-vous
        </h2>
        <div className="mt-4">
          <AppointmentInfo />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Paiement
        </h2>
        <div className="mt-4">
          <PaymentInfo />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Horaires
        </h2>
        <div className="mt-3">
          <OpeningHours hours={openingHours} compact note={salon.openingHoursNote} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Réseaux
        </h2>
        <SocialLinks className="mt-3" />
      </div>

      <Link
        href="/rendez-vous"
        className="inline-flex items-center rounded-sm border border-white/20 px-5 py-2.5 text-sm font-medium transition-colors hover:border-white/40 hover:text-[var(--color-foreground)]"
      >
        Prendre rendez-vous
      </Link>
    </div>
  );
}
