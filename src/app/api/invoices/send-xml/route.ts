import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";
import { buildFacturXXml, stripeInvoiceToFactureData } from "@/lib/facturx";

/**
 * POST /api/invoices/send-xml
 *
 * Envoie le fichier XML (Cross Industry Invoice) d'une facture Stripe par
 * email à une ou plusieurs adresses.
 *
 * ⚠️ Nécessite la variable d'environnement RESEND_API_KEY (Resend.com,
 * offre gratuite disponible) pour un envoi réel. Sans cette clé, la route
 * fonctionne en mode démonstration : elle retourne le XML généré sans
 * l'envoyer réellement, pour permettre de tester le parcours complet.
 *
 * Body attendu : { invoiceId: string, emails: string[] }
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  try {
    const { invoiceId, emails } = await req.json();
    if (!invoiceId || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "invoiceId et au moins une adresse email sont requis." }, { status: 400 });
    }

    const validEmails = emails
      .map((e: string) => e.trim())
      .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (validEmails.length === 0) {
      return NextResponse.json({ error: "Aucune adresse email valide fournie." }, { status: 400 });
    }

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
      address: customer?.address?.line1 || undefined,
      postalCode: customer?.address?.postal_code || undefined,
      city: customer?.address?.city || undefined,
      vatNumber: invoice.customer_tax_ids?.[0]?.value || undefined,
    };

    const factureData = stripeInvoiceToFactureData(invoice, seller, buyer);
    const xml = buildFacturXXml(factureData);
    const filename = `facture-${factureData.invoiceNumber}.xml`;

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      // Mode démonstration : aucun service d'envoi d'email configuré.
      return NextResponse.json({
        sent: false,
        demo: true,
        recipients: validEmails,
        xmlPreview: xml.slice(0, 400) + "…",
        message: "Mode démonstration — aucun envoi réel n'a été effectué (RESEND_API_KEY non configurée).",
      });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: process.env.INVOICE_SENDER_EMAIL || "factures@prolocal-landes.fr",
      to: validEmails,
      subject: `Facture ${factureData.invoiceNumber} — Prolocal-Landes (XML)`,
      text: `Veuillez trouver ci-joint le fichier XML de la facture ${factureData.invoiceNumber} au format Factur-X (Cross Industry Invoice).`,
      attachments: [
        {
          filename,
          content: Buffer.from(xml, "utf-8").toString("base64"),
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Erreur lors de l'envoi de l'email." }, { status: 500 });
    }

    return NextResponse.json({ sent: true, demo: false, recipients: validEmails });
  } catch (err: any) {
    console.error("[api/invoices/send-xml] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'envoi de la facture." }, { status: 500 });
  }
}
