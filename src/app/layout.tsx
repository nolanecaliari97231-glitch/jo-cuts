import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "JO'Cuts — Barbershop Martinique",
    template: "%s | JO'Cuts",
  },
  description:
    "Barbershop soigné et familial en Martinique. Coupes homme, barbe et rendez-vous en ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
