import { getProfessionals } from "@/lib/storage";

/**
 * Compte le nombre de professionnels actifs par catégorie et par
 * sous-catégorie. Utilisé pour masquer, côté front office, toute catégorie
 * ou sous-catégorie qui ne contient aucun professionnel inscrit — cohérent
 * avec ce qu'un visiteur verrait effectivement dans les résultats
 * (seuls les professionnels au statut "active" y sont affichés).
 */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getProfessionals()) {
    if (p.status !== "active") continue;
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return counts;
}

/** Compte les professionnels actifs par sous-catégorie, pour une catégorie donnée. */
export function getSubcategoryCounts(category: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getProfessionals()) {
    if (p.status !== "active" || p.category !== category || !p.subcategory) continue;
    counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
  }
  return counts;
}
