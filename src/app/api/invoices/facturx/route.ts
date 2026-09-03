import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";
import { buildFacturX, stripeInvoiceToFactureData } from "@/lib/facturx";

/**
 * GET /api/invoices/facturx?invoiceId=in_...
 *
 * Génère et retourne la facture au format Factur-X : un fichier PDF
 * dans lequel est embarqué le XML structuré (Cross Industry Invoice),
 * conformément au mécanisme de la norme française de facturation
 * électronique. Le fichier est renvoyé en téléchargement direct.
 */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  const invoiceId = req.nextUrl.searchParams.get("invoiceId");
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId manquant." }, { status: 400 });
  }

  try {
    const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ["customer"] });
    const customer = invoice.customer as any;

    const seller = {
      name: "Prolocal-Landes",
      address: "12 rue de la Forêt",
      postalCode: "40000",
      city: "Mont-de-Marsan",
      siren: process.env.PROLOCAL_SIREN || undefined,
      vatNumber: process.env.PROLOCAL_VAT_NUMBER || undefined,
    };

    const buyer = {
      name: customer?.name || invoice.customer_name || "Client",
      address: customer?.address?.line1 || invoice.customer_address?.line1 || undefined,
      postalCode: customer?.address?.postal_code || invoice.customer_address?.postal_code || undefined,
      city: customer?.address?.city || invoice.customer_address?.city || undefined,
      siren: customer?.metadata?.siren || undefined,
      vatNumber: invoice.customer_tax_ids?.[0]?.value || undefined,
      email: customer?.email || invoice.customer_email || undefined,
    };

    const factureData = stripeInvoiceToFactureData(invoice, seller, buyer);
    const pdfBytes = await buildFacturX(factureData);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${factureData.invoiceNumber}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[api/invoices/facturx] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la génération de la facture." }, { status: 500 });
  }
}
