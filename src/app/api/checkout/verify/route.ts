import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * GET /api/checkout/verify?session_id=cs_test_...
 *
 * Vérifie côté serveur (auprès de Stripe) qu'une session de paiement a bien
 * été réglée, avant de considérer l'inscription comme payée. Ne fait jamais
 * confiance à un simple retour d'URL côté client.
 */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id manquant." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";

    return NextResponse.json({
      paid,
      planId: session.metadata?.planId || null,
      optionIds: session.metadata?.optionIds ? session.metadata.optionIds.split(",").filter(Boolean) : [],
      amountTotal: session.amount_total,
      customerId: typeof session.customer === "string" ? session.customer : session.customer?.id || null,
    });
  } catch (err: any) {
    console.error("[api/checkout/verify] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur de vérification." }, { status: 500 });
  }
}
