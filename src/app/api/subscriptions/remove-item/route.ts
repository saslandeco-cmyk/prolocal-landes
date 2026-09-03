import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * POST /api/subscriptions/remove-item
 *
 * Retire un seul produit d'un abonnement groupé (plusieurs produits
 * facturés ensemble dans un même abonnement Stripe), sans résilier les
 * autres produits de cet abonnement.
 *
 * ⚠️ Un abonnement Stripe doit toujours contenir au moins une ligne
 * (item) active. Si le produit à retirer est le dernier restant, la
 * requête est refusée — il faut alors résilier l'abonnement entier via
 * /api/subscriptions/cancel.
 *
 * Body attendu : { subscriptionId: string, itemId: string }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  try {
    const { subscriptionId, itemId } = await req.json();
    if (!subscriptionId || !itemId) {
      return NextResponse.json({ error: "subscriptionId ou itemId manquant." }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.items.data.length <= 1) {
      return NextResponse.json(
        { error: "C'est le dernier produit de cet abonnement — résiliez l'abonnement entier plutôt que ce produit seul." },
        { status: 400 }
      );
    }

    await stripe.subscriptionItems.del(itemId, {
      proration_behavior: "create_prorations",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/subscriptions/remove-item] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la résiliation de ce produit." }, { status: 500 });
  }
}
