import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * POST /api/subscriptions/cancel
 *
 * Résilie un abonnement Stripe. Par défaut, résiliation à la fin de la
 * période en cours (le professionnel garde l'accès jusqu'à la prochaine
 * échéance déjà payée) ; passez immediate: true pour une résiliation
 * immédiate.
 *
 * Body attendu : { subscriptionId: string, immediate?: boolean }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  try {
    const { subscriptionId, immediate } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId manquant." }, { status: 400 });
    }

    const subscription = immediate
      ? await stripe.subscriptions.cancel(subscriptionId)
      : await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    return NextResponse.json({
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (err: any) {
    console.error("[api/subscriptions/cancel] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la résiliation." }, { status: 500 });
  }
}
