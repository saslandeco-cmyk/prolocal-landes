import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";
import { PLAN_PRICES, OPTION_PRICES } from "@/lib/pricing";

/**
 * POST /api/checkout
 *
 * Crée une session Stripe Checkout regroupant la formule choisie et les
 * options complémentaires mensuelles. Les frais uniques (ex : rédaction
 * SEO) sont ajoutés à la même session sous forme de ligne non récurrente.
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

    const lineItems: Array<{
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string };
        recurring?: { interval: "month" };
      };
      quantity: number;
    }> = [];

    // Formule
    if (planId && PLAN_PRICES[planId]) {
      const item = PLAN_PRICES[planId];
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: item.unitAmount,
          product_data: { name: item.name },
          recurring: { interval: "month" },
        },
        quantity: 1,
      });
    }

    // Options complémentaires
    for (const id of optionIds) {
      const opt = OPTION_PRICES[id];
      if (!opt) continue;
      if (opt.cadence === "once") {
        lineItems.push({
          price_data: {
            currency: "eur",
            unit_amount: opt.unitAmount,
            product_data: { name: opt.name },
          },
          quantity: 1,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: "eur",
            unit_amount: opt.unitAmount,
            product_data: { name: opt.name },
            recurring: { interval: "month" },
          },
          quantity: 1,
        });
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "Aucun élément à facturer." }, { status: 400 });
    }

    const hasRecurring = lineItems.some(li => li.price_data.recurring);
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: hasRecurring ? "subscription" : "payment",
      line_items: lineItems as any,
      customer_email: email || undefined,
      success_url: `${origin}/inscription?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/inscription?stripe_cancelled=1`,
      metadata: {
        companyName,
        planId: planId || "",
        optionIds: optionIds.join(","),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[api/checkout] Erreur création session Stripe:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
