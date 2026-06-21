import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import ServiceCard from "@/components/ServiceCard";
import { getActiveServiceCategories } from "@/lib/service-data";
import { salon } from "@/lib/salon";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const categories = await getActiveServiceCategories();

  return (
    <>
      <PageIntro
        title="Services"
        description="Prestations chez le barbier ou à domicile en Martinique. Supplément déplacement fixé selon votre commune."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-14 space-y-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
          <p>{salon.serviceScope}</p>
          <p>{salon.appointmentTimingNote}</p>
        </div>

        <div className="space-y-14">
          {categories.map((category) => (
            <section key={category.name}>
              <h2 className="mb-6 border-b border-white/10 pb-3 font-serif text-2xl">
                {category.name}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {category.services.map((service) => (
                  <ServiceCard key={service.name} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
