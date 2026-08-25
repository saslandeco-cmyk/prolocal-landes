/**
 * Tarification utilisée pour construire les sessions Stripe Checkout.
 * Centralisé côté serveur pour ne jamais faire confiance aux montants
 * envoyés par le client (sécurité : le prix facturé doit toujours être
 * déterminé côté serveur, jamais par le navigateur).
 */

export type Cadence = "month";

export interface CheckoutItem {
  id: string;
  name: string;
  /** Montant en centimes d'euro */
  unitAmount: number;
  cadence: Cadence | "once";
}

// Formules (abonnement mensuel)
export const PLAN_PRICES: Record<string, CheckoutItem> = {
  premium: { id: "premium", name: "Formule Premium", unitAmount: 900,  cadence: "month" },
  gold:    { id: "gold",    name: "Formule Gold",     unitAmount: 2900, cadence: "month" },
};

// Options complémentaires
export const OPTION_PRICES: Record<string, CheckoutItem> = {
  pub:   { id: "pub",   name: "Encart publicitaire ciblé", unitAmount: 5000, cadence: "month" },
  seo:   { id: "seo",   name: "Service de rédaction SEO",  unitAmount: 5000, cadence: "once"  },
  crm:   { id: "crm",   name: "Gestion prospects/clients", unitAmount: 3000, cadence: "month" },
};
