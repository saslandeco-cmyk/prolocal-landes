import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * POST /api/subscriptions/confirm-payment-method
 *
 * À appeler juste après la confirmation réussie d'un SetupIntent côté
 * navigateur : définit la nouvelle carte comme moyen de paiement par
 * défaut du client, et (si un abonnement est fourni) de cet abonnement.
 *
 * Body attendu : { customerId: string, paymentMethodId: string, subscriptionId?: string }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  try {
    const { customerId, paymentMethodId, subscriptionId } = await req.json();
    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: "customerId ou paymentMethodId manquant." }, { status: 400 });
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    if (subscriptionId) {
      await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/subscriptions/confirm-payment-method] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la mise à jour du moyen de paiement." }, { status: 500 });
  }
}
