import { Professional } from "@/types";

/**
 * Ordre d'affichage des fiches professionnelles dans les résultats de
 * recherche et les pages catégories :
 *   0. Formule Gold active
 *   1. Formule Premium active
 *   2. Formule Standard avec email et téléphone renseignés
 *   3. Fiches sans coordonnées (email ou téléphone manquant) — toujours en dernier,
 *      quelle que soit la formule.
 */
export function getListingRank(p: Professional): number {
  const hasContact = Boolean((p.email ?? "").trim()) && Boolean((p.phone ?? "").trim());
  if (!hasContact) return 3;
  if (p.plan === "gold") return 0;
  if (p.plan === "premium") return 1;
  return 2; // standard avec coordonnées complètes
}

/** Trie une liste de professionnels selon l'ordre d'affichage standard du site. */
export function sortByListingRank(pros: Professional[]): Professional[] {
  return [...pros].sort((a, b) => getListingRank(a) - getListingRank(b));
}
