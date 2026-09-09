import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured, getOrCreateProduct } from "@/lib/stripeServer";
import { PLAN_PRICES } from "@/lib/pricing";

/**
 * POST /api/subscriptions/downgrade
 *
 * Gère les rétrogradations différées de formule :
 *  - Gold → Premium
 *  - Premium → Standard (gratuite)
 *
 * Dans les deux cas, la formule actuelle continue jusqu'à sa date de
 * renouvellement en cours (aucune résiliation immédiate) ; le premier
 * prélèvement de la nouvelle formule (le cas échéant) ne débute que le
 * lendemain de cette date de renouvellement.
 *
 * Mécanisme Stripe utilisé : la formule en cours est programmée pour se
 * résilier à la fin de sa période déjà payée (`cancel_at_period_end`), et
 * si la nouvelle formule est payante (cas Gold → Premium), un nouvel
 * abonnement est créé immédiatement mais avec `trial_end` fixé au
 * lendemain de la fin de période de l'ancienne formule — Stripe ne
 * facturera donc ce nouvel abonnement qu'à partir de cette date exacte,
 * sans nécessiter de tâche planifiée côté serveur.
 *
 * Body attendu : { customerId: string, targetPlanId: "premium" | "standard" }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  try {
    const { customerId, targetPlanId } = await req.json();
    if (!customerId || !targetPlanId) {
      return NextResponse.json({ error: "customerId ou targetPlanId manquant." }, { status: 400 });
    }

    // Retrouve l'abonnement de la formule actuellement active pour ce client
    const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 100 });
    const currentPlanSub = activeSubs.data.find(sub => sub.metadata?.type === "plan");

    if (!currentPlanSub) {
      return NextResponse.json({ error: "Aucune formule payante active trouvée pour ce client." }, { status: 404 });
    }

    const currentPeriodEnd: number = (currentPlanSub as any).current_period_end;
    // Lendemain de la date de renouvellement en cours (00h00 ce jour-là)
    const effectiveTimestamp = currentPeriodEnd + 24 * 60 * 60;
    const effectiveDate = new Date(effectiveTimestamp * 1000).toISOString();

    // La formule actuelle continue jusqu'à sa date de renouvellement, puis se résilie
    await stripe.subscriptions.update(currentPlanSub.id, { cancel_at_period_end: true });

    let newSubscriptionId: string | undefined;

    if (targetPlanId !== "standard" && PLAN_PRICES[targetPlanId]) {
      // Nouvelle formule payante (Gold → Premium) : créée dès maintenant,
      // mais en période d'essai jusqu'au lendemain du renouvellement de
      // l'ancienne formule — aucun prélèvement avant cette date précise.
      const item = PLAN_PRICES[targetPlanId];
      const productId = await getOrCreateProduct(item.stripeProductId, item.name);

      const customer = await stripe.customers.retrieve(customerId) as any;
      const defaultPaymentMethod = customer?.invoice_settings?.default_payment_method || undefined;

      const newSub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: { currency: "eur", unit_amount: item.unitAmount, recurring: { interval: "month" }, product: productId },
          quantity: 1,
        }],
        default_payment_method: defaultPaymentMethod,
        trial_end: effectiveTimestamp,
        metadata: { type: "plan", planId: targetPlanId, scheduledDowngrade: "true" },
      });
      newSubscriptionId = newSub.id;
    }
    // Si targetPlanId === "standard" (gratuite), aucun nouvel abonnement à créer :
    // le professionnel repassera simplement en formule gratuite à la date effective.

    return NextResponse.json({ ok: true, effectiveDate, newSubscriptionId });
  } catch (err: any) {
    console.error("[api/subscriptions/downgrade] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la programmation du changement de formule." }, { status: 500 });
  }
}
