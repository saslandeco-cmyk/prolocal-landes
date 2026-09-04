import { MetadataRoute } from "next";
import { CATEGORY_META } from "@/lib/categoryData";
import { CITY_META } from "@/lib/cityData";
import { buildProfileUrl, categorySlug, subcategorySlugForUrl } from "@/lib/profileUrl";
import { SUBCATEGORIES } from "@/types";
import { dbGetAllProfessionals } from "@/lib/db/professionals";
import { isDbConfigured } from "@/lib/db/client";
import { getAllEntreprisesForSitemap } from "@/lib/sirene/db";
import { buildEntrepriseUrl } from "@/lib/sirene/url";

/**
 * Sitemap.xml — couvre toutes les pages statiques, les pages catégories,
 * les pages ville, et — depuis la migration vers une base de données
 * réelle — les fiches professionnelles individuelles elles-mêmes (quand
 * la base est configurée et alimentée).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prolocal-landes.fr";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/annuaire`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/entreprises`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/protection-donnees-personnelles`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORY_META).map(slug => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const subcategoryRoutes: MetadataRoute.Sitemap = Object.values(CATEGORY_META).flatMap(meta =>
    (SUBCATEGORIES[meta.category] || []).map(sub => ({
      url: `${baseUrl}/categories/${categorySlug(meta.category)}/${subcategorySlugForUrl(sub)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const cityRoutes: MetadataRoute.Sitemap = Object.values(CITY_META).map(city => ({
    url: `${baseUrl}/annuaire/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // Fiches professionnelles individuelles — uniquement si la base de
  // données est configurée et alimentée (voir étapes 1-5 de la migration).
  let profileRoutes: MetadataRoute.Sitemap = [];
  if (isDbConfigured) {
    try {
      const professionals = await dbGetAllProfessionals();
      profileRoutes = professionals
        .filter(p => p.status === "active")
        .map(p => ({
          url: `${baseUrl}${buildProfileUrl(p)}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: "monthly" as const,
          priority: p.plan === "gold" ? 0.9 : p.plan === "premium" ? 0.7 : 0.5,
        }));
    } catch {
      // Base indisponible ponctuellement : on continue avec le reste du sitemap
    }
  }

  // Entreprises SIRENE (base exhaustive des entreprises des Landes — étape 5)
  let entrepriseRoutes: MetadataRoute.Sitemap = [];
  if (isDbConfigured) {
    try {
      const entreprises = await getAllEntreprisesForSitemap();
      entrepriseRoutes = entreprises.map(e => ({
        url: `${baseUrl}${buildEntrepriseUrl(e)}`,
        lastModified: new Date(e.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
    } catch {
      // Base indisponible ponctuellement : on continue avec le reste du sitemap
    }
  }

  return [...staticRoutes, ...categoryRoutes, ...subcategoryRoutes, ...cityRoutes, ...profileRoutes, ...entrepriseRoutes];
}
