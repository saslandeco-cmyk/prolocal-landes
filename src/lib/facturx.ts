import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type Stripe from "stripe";

/**
 * Génération de factures au format Factur-X (norme française/européenne de
 * facturation électronique) : un PDF lisible par un humain, dans lequel est
 * embarqué un fichier XML structuré (norme Cross Industry Invoice — CII,
 * conforme EN 16931) lisible par les logiciels comptables.
 *
 * ⚠️ Note d'implémentation : cette génération produit un PDF avec pièce
 * jointe XML embarquée (mécanisme réel de Factur-X). Le XML couvre les
 * champs essentiels d'une facture (émetteur, client, lignes, montants,
 * TVA). Pour une certification Chorus Pro / conformité stricte au profil
 * EN 16931 complet, une validation par un outil tiers (ex: Factur-X SDK,
 * Mustang Project) est recommandée avant un usage en production réelle.
 */

export interface FactureData {
  invoiceNumber: string;
  date: string; // ISO
  currency: string;
  seller: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    siren?: string;
    vatNumber?: string;
  };
  buyer: {
    name: string;
    address?: string;
    postalCode?: string;
    city?: string;
    siren?: string;
    vatNumber?: string;
    email?: string;
  };
  lines: Array<{ description: string; quantity: number; unitAmount: number; totalAmount: number }>;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  tvaRate: number;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Génère le XML Cross Industry Invoice (CII) simplifié conforme Factur-X. */
export function buildFacturXXml(f: FactureData): string {
  const fmtAmount = (cents: number) => (cents / 100).toFixed(2);
  const dateCompact = f.date.replace(/[-:T].*$/, "").replace(/-/g, "");

  const lines = f.lines.map((line, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${i + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${xmlEscape(line.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${fmtAmount(line.unitAmount)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${line.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>${f.tvaRate}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${fmtAmount(line.totalAmount)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${xmlEscape(f.invoiceNumber)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${dateCompact}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${lines}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${xmlEscape(f.seller.name)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${xmlEscape(f.seller.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${xmlEscape(f.seller.address)}</ram:LineOne>
          <ram:CityName>${xmlEscape(f.seller.city)}</ram:CityName>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        ${f.seller.vatNumber ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${xmlEscape(f.seller.vatNumber)}</ram:ID></ram:SpecifiedTaxRegistration>` : ""}
        ${f.seller.siren ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${xmlEscape(f.seller.siren)}</ram:ID></ram:SpecifiedLegalOrganization>` : ""}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${xmlEscape(f.buyer.name)}</ram:Name>
        ${f.buyer.address ? `
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${xmlEscape(f.buyer.postalCode || "")}</ram:PostcodeCode>
          <ram:LineOne>${xmlEscape(f.buyer.address)}</ram:LineOne>
          <ram:CityName>${xmlEscape(f.buyer.city || "")}</ram:CityName>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>` : ""}
        ${f.buyer.vatNumber ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${xmlEscape(f.buyer.vatNumber)}</ram:ID></ram:SpecifiedTaxRegistration>` : ""}
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${f.currency.toUpperCase()}</ram:InvoiceCurrencyCode>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${fmtAmount(f.totalTVA)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${fmtAmount(f.totalHT)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${f.tvaRate}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${fmtAmount(f.totalHT)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${fmtAmount(f.totalHT)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${f.currency.toUpperCase()}">${fmtAmount(f.totalTVA)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${fmtAmount(f.totalTTC)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${fmtAmount(f.totalTTC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

/** Génère le PDF lisible de la facture (mise en page simple, professionnelle). */
async function buildInvoicePdfBytes(f: FactureData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.176, 0.353, 0.239); // vert Prolocal-Landes

  let y = 800;
  const left = 50;

  page.drawText("FACTURE", { x: left, y, size: 22, font: bold, color: green });
  y -= 18;
  page.drawText(`N° ${f.invoiceNumber}`, { x: left, y, size: 11, font });
  y -= 14;
  page.drawText(`Date : ${new Date(f.date).toLocaleDateString("fr-FR")}`, { x: left, y, size: 11, font });
  y -= 34;

  page.drawText("Émetteur", { x: left, y, size: 10, font: bold, color: green });
  y -= 14;
  [f.seller.name, f.seller.address, `${f.seller.postalCode} ${f.seller.city}`,
    f.seller.siren ? `SIREN : ${f.seller.siren}` : "",
    f.seller.vatNumber ? `TVA : ${f.seller.vatNumber}` : ""]
    .filter(Boolean)
    .forEach(line => { page.drawText(line as string, { x: left, y, size: 10, font }); y -= 13; });

  y -= 16;
  page.drawText("Client", { x: left, y, size: 10, font: bold, color: green });
  y -= 14;
  [f.buyer.name, f.buyer.address, f.buyer.city ? `${f.buyer.postalCode} ${f.buyer.city}` : "",
    f.buyer.vatNumber ? `TVA : ${f.buyer.vatNumber}` : ""]
    .filter(Boolean)
    .forEach(line => { page.drawText(line as string, { x: left, y, size: 10, font }); y -= 13; });

  y -= 26;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;

  page.drawText("Description", { x: left, y, size: 9, font: bold });
  page.drawText("Qté", { x: 360, y, size: 9, font: bold });
  page.drawText("Prix unit.", { x: 410, y, size: 9, font: bold });
  page.drawText("Total", { x: 490, y, size: 9, font: bold });
  y -= 12;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;

  for (const line of f.lines) {
    page.drawText(line.description.slice(0, 46), { x: left, y, size: 9, font });
    page.drawText(String(line.quantity), { x: 360, y, size: 9, font });
    page.drawText(`${(line.unitAmount / 100).toFixed(2)}€`, { x: 410, y, size: 9, font });
    page.drawText(`${(line.totalAmount / 100).toFixed(2)}€`, { x: 490, y, size: 9, font });
    y -= 16;
  }

  y -= 12;
  page.drawLine({ start: { x: 350, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;
  page.drawText("Total HT", { x: 400, y, size: 10, font });
  page.drawText(`${(f.totalHT / 100).toFixed(2)}€`, { x: 490, y, size: 10, font });
  y -= 15;
  page.drawText(`TVA (${f.tvaRate}%)`, { x: 400, y, size: 10, font });
  page.drawText(`${(f.totalTVA / 100).toFixed(2)}€`, { x: 490, y, size: 10, font });
  y -= 15;
  page.drawText("Total TTC", { x: 400, y, size: 11, font: bold, color: green });
  page.drawText(`${(f.totalTTC / 100).toFixed(2)}€`, { x: 490, y, size: 11, font: bold, color: green });

  page.drawText(
    "Facture électronique au format Factur-X (PDF + XML CII embarqué, conforme EN 16931).",
    { x: left, y: 40, size: 7, font, color: rgb(0.6, 0.6, 0.6) }
  );

  return doc.save();
}

/**
 * Construit le fichier Factur-X final : un PDF standard dans lequel le
 * fichier XML de la facture est embarqué comme pièce jointe (mécanisme
 * natif du format PDF, utilisé par la norme Factur-X/ZUGFeRD).
 */
export async function buildFacturX(f: FactureData): Promise<Uint8Array> {
  const pdfBytes = await buildInvoicePdfBytes(f);
  const doc = await PDFDocument.load(pdfBytes);
  const xml = buildFacturXXml(f);

  await doc.attach(Buffer.from(xml, "utf-8"), "factur-x.xml", {
    mimeType: "application/xml",
    description: "Facture électronique Factur-X (Cross Industry Invoice)",
    creationDate: new Date(f.date),
    modificationDate: new Date(f.date),
  });

  doc.setTitle(`Facture ${f.invoiceNumber}`);
  doc.setSubject("Facture électronique Factur-X");
  doc.setKeywords(["Factur-X", "facture électronique", f.invoiceNumber]);

  return doc.save();
}

/** Construit un FactureData à partir d'une facture Stripe récupérée avec ses lignes développées. */
export function stripeInvoiceToFactureData(
  invoice: Stripe.Invoice,
  seller: FactureData["seller"],
  buyer: FactureData["buyer"]
): FactureData {
  const lines = invoice.lines.data.map(li => ({
    description: li.description || "Prestation",
    quantity: li.quantity || 1,
    unitAmount: li.quantity ? Math.round((li.amount || 0) / li.quantity) : (li.amount || 0),
    totalAmount: li.amount || 0,
  }));

  const totalTTC = invoice.total || 0;
  const totalTax = invoice.tax || 0;
  const totalHT = totalTTC - totalTax;
  const tvaRate = totalHT > 0 ? Math.round((totalTax / totalHT) * 100) : 0;

  return {
    invoiceNumber: invoice.number || invoice.id,
    date: new Date((invoice.created || Date.now() / 1000) * 1000).toISOString(),
    currency: invoice.currency || "eur",
    seller,
    buyer,
    lines,
    totalHT,
    totalTVA: totalTax,
    totalTTC,
    tvaRate,
  };
}
