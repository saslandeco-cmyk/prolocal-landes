import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * GET /api/subscriptions/list?customerId=cus_...
 *
 * Liste les abonnements Stripe d'un client, pour affichage dans le
 * tableau de bord du professionnel (gestion 100% custom, sans passer
 * par le Portail client Stripe).
 */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId manquant." }, { status: 400 });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    const items = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: (sub as any).current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      items: sub.items.data.map(li => ({
        name: li.price.nickname || (li.price.product as any)?.name || "Abonnement",
        amount: li.price.unit_amount,
        interval: li.price.recurring?.interval,
      })),
      defaultPaymentMethod: sub.default_payment_method && typeof sub.default_payment_method === "object"
        ? {
            brand: (sub.default_payment_method as any).card?.brand,
            last4: (sub.default_payment_method as any).card?.last4,
          }
        : null,
    }));

    return NextResponse.json({ subscriptions: items });
  } catch (err: any) {
    console.error("[api/subscriptions/list] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la récupération des abonnements." }, { status: 500 });
  }
}
