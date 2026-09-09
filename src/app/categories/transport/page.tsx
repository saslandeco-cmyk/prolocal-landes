import type { Metadata } from "next";
import CategoryPage from "@/components/category/CategoryPage";
import { CATEGORY_META } from "@/lib/categoryData";

const meta = CATEGORY_META["transport"];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prolocal-landes.fr";

export const metadata: Metadata = {
  title: `${meta.seoTitle} | Prolocal-Landes`,
  description: meta.subtitle,
  alternates: { canonical: `${baseUrl}/categories/transport` },
  openGraph: {
    title: `${meta.seoTitle} | Prolocal-Landes`,
    description: meta.subtitle,
    url: `${baseUrl}/categories/transport`,
    siteName: "Prolocal-Landes",
    locale: "fr_FR",
    type: "website",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Catégories", item: `${baseUrl}/categories` },
          { "@type": "ListItem", position: 3, name: meta.category, item: `${baseUrl}/categories/transport` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: meta.seoTitle,
        description: meta.subtitle,
        url: `${baseUrl}/categories/transport`,
        isPartOf: { "@type": "WebSite", name: "Prolocal-Landes", url: baseUrl },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage meta={meta} />
    </>
  );
}
