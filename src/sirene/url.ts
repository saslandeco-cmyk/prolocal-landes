import { slugify } from "@/lib/profileUrl";
import type { EntrepriseRow } from "./db";

/**
 * Construit l'URL SEO d'une entreprise : /entreprises/[commune]/[nom]-[siret]
 * Le SIRET en fin d'URL garantit l'unicité même pour deux entreprises
 * homonymes dans la même commune.
 */
export function buildEntrepriseUrl(e: Pick<EntrepriseRow, "siret" | "denomination" | "enseigne" | "commune">): string {
  const communeSlug = slugify(e.commune || "landes");
  const nomSlug = slugify(e.denomination || e.enseigne || "entreprise");
  return `/entreprises/${communeSlug}/${nomSlug}-${e.siret}`;
}

/** Extrait le SIRET (14 chiffres) situé à la fin du dernier segment d'URL. */
export function extractSiretFromSlug(slug: string): string | null {
  const match = slug.match(/(\d{14})$/);
  return match ? match[1] : null;
}
