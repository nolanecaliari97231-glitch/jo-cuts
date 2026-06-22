import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import PageIntro from "@/components/PageIntro";
import { getBookableServices } from "@/lib/appointment-data";
import { getClientProfile } from "@/lib/client-portal";
import { getClientSession } from "@/lib/client-session";
import { salon } from "@/lib/salon";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
};

export const dynamic = "force-dynamic";

export default async function RendezVousPage() {
  const session = await getClientSession();
  if (!session) {
    redirect("/compte/connexion?next=/rendez-vous");
  }

  const [services, profile] = await Promise.all([
    getBookableServices(),
    getClientProfile(session.clientId),
  ]);

  return (
    <>
      <PageIntro
        title="Prendre rendez-vous"
        description="Choisissez votre prestation, un créneau disponible et envoyez votre demande. Le barbier validera votre rendez-vous."
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-8 text-sm text-[var(--color-muted)]">{salon.appointmentTimingNote}</p>
        <BookingWizard
          services={services}
          profile={{
            name: profile?.name ?? session.name,
            email: profile?.email ?? session.email,
            phone: profile?.phone ?? "",
          }}
        />
      </div>
    </>
  );
}
