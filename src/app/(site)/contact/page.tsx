import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageIntro from "@/components/PageIntro";
import SalonInfo from "@/components/SalonInfo";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Contact"
        description="Une question sur une prestation, un déplacement à domicile ou un rendez-vous ? Contactez JO'Cuts directement."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <SalonInfo />
          <ContactForm />
        </div>
      </div>
    </>
  );
}
