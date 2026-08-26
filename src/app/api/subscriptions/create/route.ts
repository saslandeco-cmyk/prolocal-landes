import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";
import { PLAN_PRICES, OPTION_PRICES } from "@/lib/pricing";

/**
 * POST /api/subscriptions/create
 *
 * Crée (ou réutilise) un client Stripe puis un abonnement en statut
 * "incomplete", avec paiement géré entièrement sur le site via Stripe
 * Elements (Payment Element) — le client ne quitte jamais la page.
 *
 * Retourne le `client_secret` du PaymentIntent associé à la première
 * facture, à utiliser côté navigateur pour afficher le formulaire de
 * paiement et confirmer le règlement.
 *
 * Body attendu :
 * {
 *   planId?: "premium" | "gold",
 *   optionIds: string[],
 *   email: string,
 *   companyName: string,
 * }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans votre fichier .env.local." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const planId: string | undefined = body.planId;
    const optionIds: string[] = Array.isArray(body.optionIds) ? body.optionIds : [];
    const email: string | undefined = body.email;
    const companyName: string = body.companyName || "Inscription Prolocal-Landes";

    // ── Éléments récurrents (formule + options mensuelles) ──
    const recurringItems: Array<{ price_data: any; quantity: number }> = [];
    if (planId && PLAN_PRICES[planId]) {
      const item = PLAN_PRICES[planId];
      recurringItems.push({
        price_data: {
          currency: "eur",
          unit_amount: item.unitAmount,
          recurring: { interval: "month" },
          product_data: { name: item.name },
        },
        quantity: 1,
      });
    }
    for (const id of optionIds) {
      const opt = OPTION_PRICES[id];
      if (!opt || opt.cadence === "once") continue;
      recurringItems.push({
        price_data: {
          currency: "eur",
          unit_amount: opt.unitAmount,
          recurring: { interval: "month" },
          product_data: { name: opt.name },
        },
        quantity: 1,
      });
    }

    // ── Frais uniques (ex : rédaction SEO), ajoutés à la 1ère facture ──
    // Important : contrairement aux lignes récurrentes d'abonnement, l'API
    // `add_invoice_items[].price_data` de Stripe n'accepte PAS `product_data`
    // (création de produit à la volée) — elle exige un `product` existant.
    // On crée donc le produit Stripe correspondant juste avant de l'utiliser.
    const oneTimeInvoiceItems: Array<{ price_data: any; quantity: number }> = [];
    for (const id of optionIds) {
      const opt = OPTION_PRICES[id];
      if (!opt || opt.cadence !== "once") continue;
      const product = await stripe.products.create({ name: opt.name });
      oneTimeInvoiceItems.push({
        price_data: {
          currency: "eur",
          unit_amount: opt.unitAmount,
          product: product.id,
        },
        quantity: 1,
      });
    }

    if (recurringItems.length === 0 && oneTimeInvoiceItems.length === 0) {
      return NextResponse.json({ error: "Aucun élément à facturer." }, { status: 400 });
    }

    // ── Client Stripe : réutilise un client existant par email, sinon en crée un ──
    let customerId: string;
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      customerId = existing.data.length > 0 ? existing.data[0].id : (await stripe.customers.create({ email, name: companyName })).id;
    } else {
      customerId = (await stripe.customers.create({ name: companyName })).id;
    }

    // Cas particulier : uniquement des frais uniques (pas d'abonnement récurrent)
    // → on utilise un simple PaymentIntent plutôt qu'un abonnement.
    if (recurringItems.length === 0) {
      const amount = oneTimeInvoiceItems.reduce((sum, li) => sum + li.price_data.unit_amount * li.quantity, 0);
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "eur",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: { companyName, planId: planId || "", optionIds: optionIds.join(",") },
      });
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        customerId,
        subscriptionId: null,
        mode: "payment",
      });
    }

    // ── Abonnement (statut "incomplete" tant que le paiement n'est pas confirmé) ──
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: recurringItems as any,
      add_invoice_items: oneTimeInvoiceItems.length > 0 ? (oneTimeInvoiceItems as any) : undefined,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { companyName, planId: planId || "", optionIds: optionIds.join(",") },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    if (!paymentIntent?.client_secret) {
      return NextResponse.json({ error: "Impossible d'initialiser le paiement Stripe." }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
      subscriptionId: subscription.id,
      mode: "subscription",
    });
  } catch (err: any) {
    console.error("[api/subscriptions/create] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la création de l'abonnement." }, { status: 500 });
  }
}
