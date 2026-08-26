import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * POST /api/portal
 *
 * Crée une session du Portail client Stripe, permettant au professionnel
 * de gérer lui-même son abonnement (moyen de paiement, factures, résiliation)
 * sans interface personnalisée à construire.
 *
 * ⚠️ Nécessite qu'une configuration du Portail client ait été enregistrée au
 * moins une fois dans le Dashboard Stripe (mode test) :
 * https://dashboard.stripe.com/test/settings/billing/portal
 * Sans cette configuration, Stripe renvoie l'erreur :
 * "No configuration provided and no default configuration has been created."
 *
 * Body attendu : { customerId: string }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans votre fichier .env.local." },
      { status: 500 }
    );
  }

  try {
    const { customerId } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "customerId manquant." }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[api/portal] Erreur création session Portail client:", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'ouverture du portail client Stripe." },
      { status: 500 }
    );
  }
}
