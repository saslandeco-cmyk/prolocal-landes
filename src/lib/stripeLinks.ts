/**
 * Liens de paiement Stripe (mode TEST) — Prolocal-Landes
 *
 * Remplacez chaque URL ci-dessous par le lien de paiement Stripe que vous avez
 * créé dans votre Dashboard Stripe (Mode test) → Paiements → Liens de paiement.
 *
 * Un lien de paiement = un produit. Comme un professionnel peut choisir
 * plusieurs éléments (une formule + plusieurs options complémentaires),
 * chaque élément possède son propre lien : le professionnel règle chaque
 * élément séparément (un onglet Stripe s'ouvre pour chacun).
 *
 * ⚠️ Ce projet n'ayant pas de backend, la confirmation du paiement n'est PAS
 * vérifiée automatiquement (pas de webhook Stripe). Le professionnel confirme
 * manuellement avoir réglé, comme pour le paiement par chèque. Pour une
 * vérification automatique, il faudrait ajouter une route API qui écoute les
 * webhooks Stripe `checkout.session.completed` et met à jour la fiche.
 */

// ── Liens de paiement par formule ───────────────────────────────
export const STRIPE_PLAN_LINKS: Record<string, string> = {
  premium: "https://buy.stripe.com/test_cNi00i6ng65795e4um5wI00",
  gold:    "https://buy.stripe.com/test_eVq00i12WeBDbdme4W5wI04",
};

// ── Liens de paiement par option complémentaire ─────────────────
export const STRIPE_OPTION_LINKS: Record<string, string> = {
  pub:   "https://buy.stripe.com/test_3cI28qcLEctv3KU9OG5wI05",
  seo:   "https://buy.stripe.com/test_00w8wO8vo6573KU0e65wI03",
  crm:   "https://buy.stripe.com/test_cNi5kCh1UgJL95eaSK5wI02",
  event: "https://buy.stripe.com/test_6oU14mh1U513a9i0e65wI01",
};

/** Retourne le lien Stripe pour un id de formule, ou null si non payante / non configurée. */
export function getStripePlanLink(planId: string): string | null {
  return STRIPE_PLAN_LINKS[planId] || null;
}

/** Retourne le lien Stripe pour un id d'option complémentaire, ou null si non configurée. */
export function getStripeOptionLink(optionId: string): string | null {
  return STRIPE_OPTION_LINKS[optionId] || null;
}
