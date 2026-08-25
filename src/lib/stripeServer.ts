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
