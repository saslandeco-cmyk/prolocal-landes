import type { Metadata } from "next";
import { categoryLabelFromSlug, unslugify, extractIdFromSlug } from "@/lib/profileUrl";
import { cityMetaFromSlug } from "@/lib/cityData";
import { dbGetProfessionalById } from "@/lib/db/professionals";
import { dbGetReviewsByPro } from "@/lib/db/reviews";
import { isDbConfigured } from "@/lib/db/client";
import AnnuaireCatchAllClient from "@/components/professional/AnnuaireCatchAllClient";
import type { Professional } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prolocal-landes.fr";

/**
 * ÉTAPE 3 de la migration base de données : les pages fiches lisent
 * désormais en priorité depuis la base de données (quand la fiche y a été
 * migrée — voir étape 2, double-écriture), pour un rendu 100% serveur
 * avec des métadonnées exactes et un contenu réellement indexable par
 * Google. Si la fiche n'existe pas encore en base (pas encore
 * enregistrée depuis le déploiement de l'étape 2, ou base non
 * configurée), la page retombe automatiquement sur l'ancien
 * comportement (lecture côté client depuis localStorage) — aucune
 * régression pour les fiches non encore migrées.
 */
function parseSegments(segments: string[]) {
  if (segments.length !== 3) return null;
  const [categorySlugSeg, subcategorySlugSeg, nameSlugSeg] = segments;
  const categoryLabel = categoryLabelFromSlug(categorySlugSeg) || unslugify(categorySlugSeg);
  const subcategoryLabel = subcategorySlugSeg !== "general" ? unslugify(subcategorySlugSeg) : null;
  const id = extractIdFromSlug(nameSlugSeg);
  const nameSlugOnly = id ? nameSlugSeg.slice(0, -(id.length + 1)) : nameSlugSeg;
  const fallbackName = unslugify(nameSlugOnly) || "Fiche professionnelle";
  return { categorySlugSeg, subcategorySlugSeg, categoryLabel, subcategoryLabel, id, fallbackName };
}

async function resolveProfessional(id: string | null): Promise<Professional | null> {
  if (!id || !isDbConfigured) return null;
  try {
    return await dbGetProfessionalById(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: segments } = await params;

  // ── Page ville (1 segment) ou ville + catégorie (2 segments) ──
  if (segments.length === 1 || segments.length === 2) {
    const cityMeta = cityMetaFromSlug(segments[0]);
    if (cityMeta) {
      const categoryLabel = segments.length === 2 ? categoryLabelFromSlug(segments[1]) : null;
      const url = `${baseUrl}/annuaire/${segments.join("/")}`;
      const title = categoryLabel
        ? `${categoryLabel} à ${cityMeta.name} (${cityMeta.postalCode}) | Prolocal-Landes`
        : `Tous les professionnels et commerçants à ${cityMeta.name} (${cityMeta.postalCode}) | Prolocal-Landes`;
      const description = categoryLabel
        ? `Retrouvez tous les professionnels de la catégorie ${categoryLabel} à ${cityMeta.name}, dans les Landes. Coordonnées, avis et informations pratiques.`
        : cityMeta.seoTitle + `. Retrouvez tous les professionnels et commerçants référencés à ${cityMeta.name} (${cityMeta.postalCode}) sur Prolocal-Landes.`;

      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, siteName: "Prolocal-Landes", locale: "fr_FR", type: "website" },
      };
    }
  }

  const parsed = parseSegments(segments);
  if (!parsed) return { title: "Fiche professionnelle | Prolocal-Landes" };

  const { categoryLabel, subcategoryLabel, id, fallbackName } = parsed;
  const url = `${baseUrl}/annuaire/${segments.join("/")}`;
  const pro = await resolveProfessional(id);

  if (pro) {
    // ── Fiche trouvée en base : métadonnées 100% exactes ──
    const plainDescription = (pro.shortDescription || pro.description || "")
      .replace(/<[^>]*>/g, "").trim().slice(0, 155);
    const title = `${pro.companyName} — ${pro.subcategory || pro.category} à ${pro.city} | Prolocal-Landes`;
    const description = plainDescription ||
      `${pro.companyName}, ${pro.category} à ${pro.city} (${pro.postalCode}). Coordonnées, avis et informations sur Prolocal-Landes.`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title, description, url,
        siteName: "Prolocal-Landes", locale: "fr_FR", type: "profile",
        images: pro.banner ? [{ url: pro.banner }] : pro.logo ? [{ url: pro.logo }] : undefined,
      },
    };
  }

  // ── Repli : fiche pas encore en base, métadonnées dérivées de l'URL seule ──
  const title = `${fallbackName} — ${subcategoryLabel || categoryLabel} | Prolocal-Landes`;
  const description = `Retrouvez les coordonnées, avis et informations de ${fallbackName}, professionnel référencé dans la catégorie ${categoryLabel}${subcategoryLabel ? ` (${subcategoryLabel})` : ""} sur l'annuaire des Landes.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Prolocal-Landes", locale: "fr_FR", type: "profile" },
  };
}

export default async function AnnuaireCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;

  // ── Page ville (1 segment) ou ville + catégorie (2 segments) ──
  if (segments.length === 1 || segments.length === 2) {
    const cityMeta = cityMetaFromSlug(segments[0]);
    if (cityMeta) {
      const categoryLabel = segments.length === 2 ? categoryLabelFromSlug(segments[1]) : null;
      const url = `${baseUrl}/annuaire/${segments.join("/")}`;

      const cityJsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
              { "@type": "ListItem", position: 2, name: "Annuaire", item: `${baseUrl}/annuaire` },
              { "@type": "ListItem", position: 3, name: cityMeta.name, item: `${baseUrl}/annuaire/${cityMeta.slug}` },
              ...(categoryLabel ? [{ "@type": "ListItem", position: 4, name: categoryLabel, item: url }] : []),
            ],
          },
          {
            "@type": "CollectionPage",
            name: categoryLabel ? `${categoryLabel} à ${cityMeta.name}` : `Professionnels à ${cityMeta.name}`,
            url,
            isPartOf: { "@type": "WebSite", name: "Prolocal-Landes", url: baseUrl },
            about: { "@type": "Place", name: cityMeta.name, address: { "@type": "PostalAddress", addressLocality: cityMeta.name, postalCode: cityMeta.postalCode, addressCountry: "FR" } },
          },
          {
            // Questions génériques, cohérentes avec le contenu affiché avant
            // hydratation côté client (la page ville liste les professionnels
            // en JavaScript, donc le nombre exact n'est pas connu ici côté
            // serveur — on évite d'afficher un chiffre qui ne correspondrait
            // pas au contenu visible initial).
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Combien y a-t-il de professionnels référencés à ${cityMeta.name} ?`,
                acceptedAnswer: { "@type": "Answer", text: `Retrouvez le nombre exact de professionnels référencés à ${cityMeta.name} directement sur cette page.` },
              },
              {
                "@type": "Question",
                name: `Comment trouver un professionnel de confiance à ${cityMeta.name} ?`,
                acceptedAnswer: { "@type": "Answer", text: "Consultez les fiches détaillées, les avis vérifiés laissés par d'autres clients, et contactez directement le professionnel par téléphone, email ou WhatsApp depuis sa fiche sur Prolocal-Landes." },
              },
              {
                "@type": "Question",
                name: `Comment référencer mon entreprise à ${cityMeta.name} ?`,
                acceptedAnswer: { "@type": "Answer", text: "L'inscription est gratuite et rapide : rendez-vous sur la page d'inscription, renseignez votre numéro SIREN et les informations de votre entreprise. Votre fiche est visible immédiatement sur Prolocal-Landes." },
              },
            ],
          },
        ],
      };

      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd) }} />
          <AnnuaireCatchAllClient initialData={null} />
        </>
      );
    }
  }

  const parsed = parseSegments(segments);

  let jsonLd: Record<string, unknown> | null = null;
  let initialData: Professional | null = null;

  if (parsed) {
    const { categorySlugSeg, categoryLabel, subcategoryLabel, id, fallbackName } = parsed;
    const url = `${baseUrl}/annuaire/${segments.join("/")}`;
    const pro = await resolveProfessional(id);
    initialData = pro;

    if (pro) {
      // ── Fiche trouvée en base : JSON-LD complet avec vraies données ──
      const reviews = await dbGetReviewsByPro(pro.id).catch(() => []);
      const approvedReviews = reviews.filter(r => r.status === "approved");
      const avgRating = approvedReviews.length > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
        : null;

      jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
              { "@type": "ListItem", position: 2, name: "Annuaire", item: `${baseUrl}/annuaire` },
              { "@type": "ListItem", position: 3, name: pro.category, item: `${baseUrl}/categories/${categorySlugSeg}` },
              { "@type": "ListItem", position: 4, name: pro.companyName, item: url },
            ],
          },
          {
            "@type": "LocalBusiness",
            name: pro.companyName,
            url,
            image: pro.logo || pro.banner || undefined,
            telephone: pro.phone || undefined,
            email: pro.email || undefined,
            category: pro.subcategory || pro.category,
            address: {
              "@type": "PostalAddress",
              streetAddress: pro.address,
              addressLocality: pro.city,
              postalCode: pro.postalCode,
              addressCountry: "FR",
            },
            ...(pro.lat && pro.lng ? { geo: { "@type": "GeoCoordinates", latitude: pro.lat, longitude: pro.lng } } : {}),
            areaServed: "Landes (40), France",
            ...(avgRating ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avgRating.toFixed(1),
                reviewCount: approvedReviews.length,
              },
            } : {}),
          },
        ],
      };
    } else {
      // ── Repli : JSON-LD partiel dérivé de l'URL seule (fiche pas encore en base) ──
      jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
              { "@type": "ListItem", position: 2, name: "Annuaire", item: `${baseUrl}/annuaire` },
              { "@type": "ListItem", position: 3, name: categoryLabel, item: `${baseUrl}/categories/${categorySlugSeg}` },
              { "@type": "ListItem", position: 4, name: fallbackName, item: url },
            ],
          },
          {
            "@type": "LocalBusiness",
            name: fallbackName,
            url,
            category: subcategoryLabel || categoryLabel,
            areaServed: "Landes (40), France",
          },
        ],
      };
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AnnuaireCatchAllClient initialData={initialData} />
    </>
  );
}
