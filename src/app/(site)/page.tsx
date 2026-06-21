import Link from "next/link";
import AppointmentInfo from "@/components/AppointmentInfo";
import GalleryGrid from "@/components/GalleryGrid";
import Logo from "@/components/Logo";
import OpeningHours from "@/components/OpeningHours";
import PaymentInfo from "@/components/PaymentInfo";
import PortfolioImage from "@/components/PortfolioImage";
import ServiceCard from "@/components/ServiceCard";
import SocialLinks from "@/components/SocialLinks";
import { getFeaturedServices } from "@/lib/service-data";
import { getPublicOpeningHours } from "@/lib/availability-data";
import { getPublicGalleryImages } from "@/lib/gallery-data";
import { salon } from "@/lib/salon";

export default async function HomePage() {
  const [featuredServices, openingHours, galleryImages] = await Promise.all([
    getFeaturedServices(),
    getPublicOpeningHours(),
    getPublicGalleryImages(),
  ]);
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-left">
            <Logo variant="hero" className="md:items-start md:text-left" />
            <p className="mt-8 max-w-xl text-lg text-[var(--color-muted)] md:mx-0 mx-auto">
              {salon.pitch}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <Link
                href="/rendez-vous"
                className="inline-flex items-center rounded-sm bg-[var(--color-foreground)] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90"
              >
                Prendre rendez-vous
              </Link>
              <SocialLinks />
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-sm border border-white/10 md:max-w-sm">
            <PortfolioImage
              src="/images/gallery/10.png"
              alt="Réalisation JO'Cuts — fade et barbe"
              priority
              focus="50% 40%"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl">Nos services</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Chez le barbier ou à domicile — tarifs indicatifs, supplément déplacement sur devis.
            </p>
          </div>
          <Link
            href="/services"
            className="hidden shrink-0 text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-foreground)] md:inline"
          >
            Voir tout
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <ServiceCard key={service.name} service={service} showDescription={false} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <h2 className="font-serif text-3xl">Galerie</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Quelques réalisations — dégradés, line-ups, barbes et styles sur mesure.
            </p>
          </div>
          <GalleryGrid images={galleryImages} limit={6} showLink />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl">Comment réserver</h2>
            <p className="mt-4 text-[var(--color-muted)]">
              Deux options : venir chez le barbier ou être coiffé à domicile en Martinique.
            </p>
            <div className="mt-8">
              <AppointmentInfo />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl">Paiement</h2>
            <p className="mt-4 text-[var(--color-muted)]">
              Espèces ou carte sur place. Paiement en ligne via SumUp bientôt disponible.
            </p>
            <div className="mt-8">
              <PaymentInfo />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl">Horaires</h2>
              <p className="mt-4 text-[var(--color-muted)]">
                Horaires indicatifs — {salon.region}. Contact : {salon.phone}
              </p>
              <div className="mt-8 max-w-sm">
                <OpeningHours hours={openingHours} note={salon.openingHoursNote} />
              </div>
              <Link
                href="/contact"
                className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-[var(--color-foreground)]"
              >
                Nous contacter
              </Link>
            </div>
            <div className="rounded-sm border border-white/10 bg-[var(--color-background)] p-6">
              <h3 className="font-medium text-[var(--color-foreground)]">Adresse du salon</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{salon.locationPolicy}</p>
              <p className="mt-4 text-sm text-[var(--color-muted)]">
                Le lien Google Maps vous est transmis automatiquement après validation de votre
                rendez-vous chez le barbier.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
