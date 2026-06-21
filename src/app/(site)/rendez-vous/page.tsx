import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import PageIntro from "@/components/PageIntro";
import { getBookableServices } from "@/lib/appointment-data";
import { salon } from "@/lib/salon";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
};

export const dynamic = "force-dynamic";

export default async function RendezVousPage() {
  const services = await getBookableServices();

  return (
    <>
      <PageIntro
        title="Prendre rendez-vous"
        description="Choisissez votre prestation, un créneau disponible et envoyez votre demande. Le barbier validera votre rendez-vous."
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-8 text-sm text-[var(--color-muted)]">{salon.appointmentTimingNote}</p>
        <BookingWizard services={services} />
      </div>
    </>
  );
}
