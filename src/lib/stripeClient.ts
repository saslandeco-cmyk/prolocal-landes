"use client";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Client Stripe côté navigateur (clé publique, mode TEST).
 * Nécessite NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans .env.local
 * (clé commençant par pk_test_..., disponible dans le Dashboard Stripe
 * → Développeurs → Clés API).
 */
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn("[stripeClient] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie.");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
