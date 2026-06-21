import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublicOpeningHours } from "@/lib/availability-data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const openingHours = await getPublicOpeningHours();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer openingHours={openingHours} />
    </div>
  );
}
