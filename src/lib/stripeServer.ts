import Stripe from "stripe";

/**
 * Client Stripe côté serveur (mode TEST).
 *
 * Nécessite la variable d'environnement STRIPE_SECRET_KEY (clé secrète
 * commençant par sk_test_... en mode test, disponible dans votre
 * Dashboard Stripe → Développeurs → Clés API).
 *
 * ⚠️ Ce fichier ne doit JAMAIS être importé depuis un composant client
 * ("use client") : la clé secrète ne doit jamais transiter côté navigateur.
 * Il est destiné exclusivement aux routes API (src/app/api/**).
 */

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV !== "test") {
  console.warn(
    "[stripeServer] STRIPE_SECRET_KEY n'est pas définie. " +
    "Ajoutez-la dans votre fichier .env.local pour activer le paiement par carte."
  );
}

export const stripe = new Stripe(secretKey || "sk_test_placeholder");

export const isStripeConfigured = Boolean(secretKey);

/**
 * Récupère un Produit Stripe existant par son ID fixe, ou le crée s'il
 * n'existe pas encore. Utilisé pour les articles du catalogue (formules,
 * options complémentaires) : l'API Subscriptions de Stripe (items[] et
 * add_invoice_items[]) exige un `product` déjà existant dans price_data,
 * contrairement à Checkout Session qui accepte la création à la volée
 * (product_data).
 */
export async function getOrCreateProduct(id: string, name: string): Promise<string> {
  try {
    const product = await stripe.products.retrieve(id);
    if (!product.deleted) return product.id;
  } catch {
    // Le produit n'existe pas encore — on le crée ci-dessous.
  }
  const created = await stripe.products.create({ id, name });
  return created.id;
}
