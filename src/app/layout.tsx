import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prolocal-landes.fr";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Prolocal-landes.fr — Annuaire des professionnels des Landes",
    template: "%s",
  },
  description: "Trouvez tous les professionnels et commerçants du département des Landes (40). Annuaire local avec géolocalisation.",
  openGraph: {
    siteName: "Prolocal-Landes",
    locale: "fr_FR",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Prolocal-Landes",
  url: baseUrl,
  description: "Annuaire des professionnels et commerçants du département des Landes (40).",
  areaServed: { "@type": "AdministrativeArea", name: "Landes" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-landes-cream min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
