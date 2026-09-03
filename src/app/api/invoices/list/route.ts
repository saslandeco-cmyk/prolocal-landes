import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * GET /api/invoices/list?customerId=cus_...
 *
 * Liste les factures Stripe d'un client (toutes formules et options
 * confondues), pour affichage dans l'onglet "Mes abonnements" du
 * tableau de bord professionnel.
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
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 24 });

    const items = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      subscriptionId: typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id || null,
      hostedInvoiceUrl: inv.hosted_invoice_url,
    }));

    return NextResponse.json({ invoices: items });
  } catch (err: any) {
    console.error("[api/invoices/list] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la récupération des factures." }, { status: 500 });
  }
}
