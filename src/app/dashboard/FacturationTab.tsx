"use client";
import { useState, useEffect } from "react";
import {
  Plus, Trash2, Eye, Edit3, Copy, FileText, ChevronDown,
  Printer, ArrowLeft, Save, CheckCircle, X, ArrowRight, Loader2,
} from "lucide-react";
import {
  getDocumentsByPro, saveDocument, deleteDocument,
  getNextNumber, generateId, getBillingProfile, saveBillingProfile,
  getClients, saveClient,
} from "@/lib/storage";
import type { BillingDocument, DocumentLine, DocumentType, DocumentStatus, Client } from "@/types";
import type { Professional } from "@/types";
import type { BillingProfile } from "@/lib/storage";

// ── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<DocumentType, string> = {
  devis: "Devis", facture: "Facture", avoir: "Avoir",
};
const STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
  brouillon: { label: "Brouillon",  color: "bg-gray-100 text-gray-600" },
  envoyé:    { label: "Envoyé",     color: "bg-blue-100 text-blue-700" },
  accepté:   { label: "Accepté",   color: "bg-green-100 text-green-700" },
  refusé:    { label: "Refusé",    color: "bg-red-100 text-red-600" },
  payé:      { label: "Payé",      color: "bg-emerald-100 text-emerald-700" },
  annulé:    { label: "Annulé",    color: "bg-orange-100 text-orange-600" },
};
const VAT_RATES = [0, 5.5, 10, 20];

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function calcTotals(lines: DocumentLine[], discountPct = 0) {
  let totalHT = 0;
  const vatMap: Record<number, number> = {};
  lines.forEach(l => {
    const ht = l.quantity * l.unitPrice;
    totalHT += ht;
    vatMap[l.vatRate] = (vatMap[l.vatRate] || 0) + ht * (l.vatRate / 100);
  });
  const discount  = totalHT * (discountPct / 100);
  const htAfter   = totalHT - discount;
  const totalVAT  = Object.values(vatMap).reduce((a, b) => a + b, 0) * (1 - discountPct / 100);
  return { totalHT, discount, htAfter, vatMap, totalVAT, totalTTC: htAfter + totalVAT };
}

function today() { return new Date().toISOString().slice(0, 10); }
function addDays(d: string, n: number) {
  const dt = new Date(d); dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

function emptyLine(): DocumentLine {
  return { id: generateId(), description: "", quantity: 1, unit: "unité", unitPrice: 0, vatRate: 20 };
}

function makeDoc(pro: Professional, type: DocumentType, profile?: BillingProfile | null): BillingDocument {
  const issueDate = today();
  const p = profile;
  return {
    id: generateId(), proId: pro.id, type,
    status: "brouillon",
    number: "",
    issueDate,
    validityDate: type === "devis"    ? addDays(issueDate, 30) : undefined,
    dueDate:      type === "facture"  ? addDays(issueDate, 30) : undefined,
    client: { firstName: "", lastName: "", company: "", name: "", address: "", postalCode: "", city: "", email: "", phone: "", siret: "", vatNumber: "" },
    issuer: {
      name:       p?.companyName  || pro.companyName,
      address:    p?.address      || pro.address,
      postalCode: p?.postalCode   || pro.postalCode,
      city:       p?.city         || pro.city,
      email:      p?.email        || pro.email,
      phone:      p?.phone        || pro.phone,
      siren:      p?.siren        || pro.siren,
      siret:      p?.siret        || (pro as any).siret || "",
      legalForm:  p?.legalForm    || pro.legalForm,
      vatNumber:  p?.vatNumber    || "",
      rcs:        p?.rcs          || `RCS ${p?.city || pro.city}`,
      rm:         p?.rm           || "",
      capital:    p?.capital      || "",
      ape:        p?.ape          || "",
    },
    lines:          [emptyLine()],
    discountPct:    0,
    notes:          "",
    paymentTerms:   p?.paymentTerms  || "30 jours date de facture",
    paymentMethod:  "Virement bancaire",
    bankDetails:    p?.bankDetails   || "",
    penalty:        p?.penalty       || "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
    lateInterest:   "3× taux légal",
    recoveryFee:    p?.recoveryFee   || "40 € (indemnité forfaitaire pour frais de recouvrement, art. L.441-10 C.com.)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Print / Preview ──────────────────────────────────────────────────────────
function PrintPreview({ doc, onClose }: { doc: BillingDocument; onClose: () => void }) {
  const t = calcTotals(doc.lines, doc.discountPct);
  const typeLabel = TYPE_LABELS[doc.type].toUpperCase();

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"/><title>${doc.number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#1a1a1a;padding:20mm}
  h1{font-size:24px;font-weight:700;margin-bottom:4px}
  .num{font-size:13px;color:#4a7c5e;margin-bottom:2px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
  .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px}
  .box strong{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:6px}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#1a3a2a;color:white;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
  td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top}
  .right{text-align:right}
  .totals{margin-left:auto;width:280px;margin-top:8px}
  .totals tr td{border:none;padding:4px 8px}
  .totals .total-ttc{font-weight:700;font-size:14px;background:#1a3a2a;color:white;border-radius:4px}
  .footer{margin-top:24px;font-size:9px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px}
  .notes{margin-top:14px;font-size:10px;background:#f9fafb;padding:10px;border-radius:4px}
  @media print{body{padding:15mm}}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
  <div>
    <h1>${typeLabel}</h1>
    <p class="num">N° ${doc.number}</p>
    <p>Date : ${fmtDate(doc.issueDate)}</p>
    ${doc.validityDate ? `<p>Valable jusqu'au : ${fmtDate(doc.validityDate)}</p>` : ""}
    ${doc.dueDate ? `<p>Échéance : ${fmtDate(doc.dueDate)}</p>` : ""}
  </div>
</div>
<div class="grid2">
  <div class="box">
    <strong>Émetteur</strong>
    <b>${doc.issuer.name}</b><br/>
    ${doc.issuer.legalForm} — SIREN ${doc.issuer.siren}<br/>
    ${doc.issuer.address}<br/>
    ${doc.issuer.postalCode} ${doc.issuer.city}<br/>
    ${doc.issuer.email}<br/>
    ${doc.issuer.phone}
    ${doc.issuer.vatNumber ? `<br/>TVA : ${doc.issuer.vatNumber}` : ""}
    ${doc.issuer.rcs ? `<br/>${doc.issuer.rcs}` : ""}
  </div>
  <div class="box">
    <strong>Client</strong>
    ${doc.client.company ? `<b>${doc.client.company}</b><br/>` : ""}
    <b>${[doc.client.firstName, doc.client.lastName].filter(Boolean).join(" ") || doc.client.name}</b><br/>
    ${doc.client.address}<br/>
    ${doc.client.postalCode} ${doc.client.city}<br/>
    ${doc.client.email ? doc.client.email + "<br/>" : ""}
    ${doc.client.phone ? doc.client.phone + "<br/>" : ""}
    ${doc.client.siret ? "SIRET " + doc.client.siret + "<br/>" : ""}
    ${doc.client.vatNumber ? "TVA " + doc.client.vatNumber : ""}
  </div>
</div>
<table>
  <thead><tr>
    <th style="width:40%">Description</th>
    <th class="right">Qté</th>
    <th>Unité</th>
    <th class="right">PU HT</th>
    <th class="right">TVA %</th>
    <th class="right">Total HT</th>
  </tr></thead>
  <tbody>
    ${doc.lines.map(l => `<tr>
      <td>${l.description}</td>
      <td class="right">${l.quantity}</td>
      <td>${l.unit}</td>
      <td class="right">${fmt(l.unitPrice)} €</td>
      <td class="right">${l.vatRate} %</td>
      <td class="right">${fmt(l.quantity * l.unitPrice)} €</td>
    </tr>`).join("")}
  </tbody>
</table>
<table class="totals">
  <tr><td>Total HT</td><td class="right">${fmt(t.totalHT)} €</td></tr>
  ${(doc.discountPct ?? 0) > 0 ? `<tr><td>Remise ${doc.discountPct}%</td><td class="right">-${fmt(t.discount)} €</td></tr>
  <tr><td>Total HT après remise</td><td class="right">${fmt(t.htAfter)} €</td></tr>` : ""}
  ${Object.entries(t.vatMap).map(([rate, amt]) =>
    `<tr><td>TVA ${rate}%</td><td class="right">${fmt(amt * (1 - (doc.discountPct ?? 0) / 100))} €</td></tr>`
  ).join("")}
  <tr class="total-ttc"><td style="padding:8px">Total TTC</td><td class="right" style="padding:8px">${fmt(t.totalTTC)} €</td></tr>
</table>
${doc.type === "facture" ? `
<div class="box" style="margin-top:16px">
  <strong>Règlement</strong>
  <p>${doc.paymentMethod || ""}</p>
  ${doc.bankDetails ? `<p style="margin-top:4px;white-space:pre-line">${doc.bankDetails}</p>` : ""}
</div>` : ""}
${doc.notes ? `<div class="notes"><strong>Notes :</strong> ${doc.notes}</div>` : ""}
${doc.lines.every(l => Number(l.vatRate) === 0) ? `<div style="margin-top:14px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;"><p style="font-size:10px;color:#92400e;font-style:italic;margin:0;">TVA non applicable, art. 293 B du Code général des impôts.</p></div>` : ""}
<div class="footer">
  ${doc.penalty ? `<p>${doc.penalty}</p>` : ""}
  ${doc.recoveryFee ? `<p style="margin-top:4px">${doc.recoveryFee}</p>` : ""}
  <p style="margin-top:8px">
    Dénomination sociale : ${doc.issuer.name}
    — Forme juridique : ${doc.issuer.legalForm}
    ${(doc.issuer.rcs || doc.issuer.rm) ? ` — RCS ou RM : ${doc.issuer.rcs || doc.issuer.rm}` : ""}
    — SIREN ou SIRET : ${doc.issuer.siret || doc.issuer.siren}
    ${doc.issuer.vatNumber ? ` — N° de TVA intracommunautaire : ${doc.issuer.vatNumber}` : ""}
    ${doc.issuer.capital ? ` — Capital ${doc.issuer.capital} €` : ""}
    ${doc.issuer.ape ? ` — APE ${doc.issuer.ape}` : ""}
  </p>
</div>
</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-landes-pine">Aperçu — {doc.number}</h3>
          <div className="flex gap-2">
            <button onClick={print} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Printer className="w-4 h-4" /> Imprimer / PDF
            </button>
            <button onClick={onClose} className="btn-secondary py-2 px-3 text-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-8 text-sm font-[Arial]">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-landes-pine">{typeLabel}</h2>
              <p className="text-landes-sage font-semibold">N° {doc.number}</p>
              <p className="text-gray-500 text-xs mt-1">Date : {fmtDate(doc.issueDate)}</p>
              {doc.validityDate && <p className="text-gray-500 text-xs">Valable jusqu'au : {fmtDate(doc.validityDate)}</p>}
              {doc.dueDate && <p className="text-gray-500 text-xs">Échéance : {fmtDate(doc.dueDate)}</p>}
            </div>
          </div>
          {/* Parties */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Émetteur", d: doc.issuer },
              { label: "Client",   d: doc.client },
            ].map(({ label, d }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-xs space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{label}</p>
                {"firstName" in d && (d as any).company && <p className="font-bold text-gray-800">{(d as any).company}</p>}
                <p className="font-bold text-gray-800">
                  {"firstName" in d
                    ? [[( d as any).firstName, (d as any).lastName].filter(Boolean).join(" ") || d.name]
                    : [d.name]}
                </p>
                {"legalForm" in d && <p className="text-gray-500">{(d as any).legalForm} — SIREN {(d as any).siren}</p>}
                <p className="text-gray-600">{d.address}</p>
                <p className="text-gray-600">{d.postalCode} {d.city}</p>
                {d.email && <p className="text-gray-500">{d.email}</p>}
                {d.phone && <p className="text-gray-500">{d.phone}</p>}
                {"siret" in d && (d as any).siret && <p className="text-gray-500">SIRET {(d as any).siret}</p>}
                {"vatNumber" in d && (d as any).vatNumber && <p className="text-gray-500">TVA {(d as any).vatNumber}</p>}
              </div>
            ))}
          </div>
          {/* Lines */}
          <table className="w-full text-xs mb-4">
            <thead><tr className="bg-landes-pine text-white">
              {["Description","Qté","Unité","PU HT","TVA","Total HT"].map(h => (
                <th key={h} className="py-2 px-3 text-left font-medium last:text-right">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {doc.lines.map((l, i) => (
                <tr key={l.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2 px-3">{l.description}</td>
                  <td className="py-2 px-3">{l.quantity}</td>
                  <td className="py-2 px-3">{l.unit}</td>
                  <td className="py-2 px-3 text-right">{fmt(l.unitPrice)} €</td>
                  <td className="py-2 px-3 text-right">{l.vatRate} %</td>
                  <td className="py-2 px-3 text-right">{fmt(l.quantity * l.unitPrice)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 text-xs space-y-1">
              <div className="flex justify-between"><span>Total HT</span><span className="font-semibold">{fmt(t.totalHT)} €</span></div>
              {(doc.discountPct ?? 0) > 0 && <>
                <div className="flex justify-between text-orange-600"><span>Remise {doc.discountPct}%</span><span>−{fmt(t.discount)} €</span></div>
                <div className="flex justify-between"><span>HT après remise</span><span>{fmt(t.htAfter)} €</span></div>
              </>}
              {Object.entries(t.vatMap).map(([r, a]) => (
                <div key={r} className="flex justify-between text-gray-500">
                  <span>TVA {r}%</span>
                  <span>{fmt(a * (1 - (doc.discountPct ?? 0) / 100))} €</span>
                </div>
              ))}
              <div className="flex justify-between bg-landes-pine text-white px-3 py-2 rounded-lg mt-1">
                <span className="font-bold">Total TTC</span>
                <span className="font-bold">{fmt(t.totalTTC)} €</span>
              </div>
            </div>
          </div>
          {/* TVA non applicable — mention légale visible */}
          {doc.lines.every(l => Number(l.vatRate) === 0) && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-800 font-medium italic">
                TVA non applicable, art. 293 B du Code général des impôts.
              </p>
            </div>
          )}
          {/* Notes / paiement */}
          {doc.notes && <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-600"><strong>Notes :</strong> {doc.notes}</div>}
          {doc.type === "facture" && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs">
              <p className="font-semibold text-gray-700 mb-1">Modalités de paiement</p>
              <p className="text-gray-600">{doc.paymentMethod}</p>
              {doc.bankDetails && <p className="text-gray-500 mt-1 whitespace-pre-line">{doc.bankDetails}</p>}
            </div>
          )}
          {/* Mentions légales */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-[10px] text-gray-400 space-y-1">
            {doc.penalty && <p>{doc.penalty}</p>}
            {doc.recoveryFee && <p>{doc.recoveryFee}</p>}
            <p className="pt-1">
              Dénomination sociale : {doc.issuer.name}
              {" — "}Forme juridique : {doc.issuer.legalForm}
              {(doc.issuer.rcs || doc.issuer.rm) && <> — RCS ou RM : {doc.issuer.rcs || doc.issuer.rm}</>}
              {" — "}SIREN ou SIRET : {doc.issuer.siret || doc.issuer.siren}
              {doc.issuer.vatNumber && <> — N° de TVA intracommunautaire : {doc.issuer.vatNumber}</>}
              {doc.issuer.capital && <> — Capital {doc.issuer.capital} €</>}
              {doc.issuer.ape && <> — APE {doc.issuer.ape}</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Document Editor ──────────────────────────────────────────────────────────
function DocEditor({
  doc: initial, onSave, onBack,
}: { doc: BillingDocument; onSave: (d: BillingDocument) => void; onBack: () => void }) {
  const [doc, setDoc] = useState<BillingDocument>({ ...initial });
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const isReadonly = doc.type === "devis" && doc.status === "accepté";

  const upd = (patch: Partial<BillingDocument>) => setDoc(d => ({ ...d, ...patch }));
  const updClient = (patch: Partial<BillingDocument["client"]>) =>
    setDoc(d => {
      const client = { ...d.client, ...patch };
      // Recalcule le champ name combiné
      const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ");
      client.name = client.company || fullName || "";
      return { ...d, client };
    });
  const updIssuer = (patch: Partial<BillingDocument["issuer"]>) =>
    setDoc(d => ({ ...d, issuer: { ...d.issuer, ...patch } }));
  const updLine = (id: string, patch: Partial<DocumentLine>) =>
    setDoc(d => ({ ...d, lines: d.lines.map(l => l.id === id ? { ...l, ...patch } : l) }));
  const addLine = () => setDoc(d => ({ ...d, lines: [...d.lines, emptyLine()] }));
  const removeLine = (id: string) => setDoc(d => ({ ...d, lines: d.lines.filter(l => l.id !== id) }));

  const t = calcTotals(doc.lines, doc.discountPct);

  const handleSave = () => {
    onSave({ ...doc, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage bg-white ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`;
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-5">
      {preview && <PrintPreview doc={doc} onClose={() => setPreview(false)} />}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-landes-forest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
        <div className="flex gap-2">
          <button onClick={() => setPreview(true)} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
            <Eye className="w-4 h-4" /> Aperçu
          </button>
          {!isReadonly && (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              {saved ? <><CheckCircle className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> Enregistrer</>}
            </button>
          )}
        </div>
      </div>

      {/* Readonly banner */}
      {isReadonly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            Ce devis a été <strong>accepté</strong> — il n'est plus modifiable. Vous pouvez le convertir en facture depuis la liste.
          </p>
        </div>
      )}

      {/* Info générale */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-landes-pine">Informations générales</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Type</label>
            <select value={doc.type} onChange={e => upd({ type: e.target.value as DocumentType })} disabled={isReadonly} className={inputCls}>
              {(["devis","facture","avoir"] as const).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={doc.status} onChange={e => upd({ status: e.target.value as DocumentStatus })} disabled={isReadonly} className={inputCls}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date d'émission</label>
            <input type="date" value={doc.issueDate} onChange={e => upd({ issueDate: e.target.value })} disabled={isReadonly} className={inputCls} />
          </div>
          {doc.type === "devis" && (
            <div>
              <label className={labelCls}>Date de validité</label>
              <input type="date" value={doc.validityDate || ""} onChange={e => upd({ validityDate: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
          )}
          {doc.type === "facture" && (
            <div>
              <label className={labelCls}>Date d'échéance</label>
              <input type="date" value={doc.dueDate || ""} onChange={e => upd({ dueDate: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
          )}
        </div>
      </div>

      {/* Émetteur + Client */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Émetteur */}
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-landes-pine text-sm">Émetteur</h3>
          <div className="grid grid-cols-1 gap-3">
            {([
              ["Raison sociale", "name"],
              ["Adresse", "address"],
              ["Code postal", "postalCode"],
              ["Ville", "city"],
              ["Email", "email"],
              ["Téléphone", "phone"],
              ["N° TVA intracommunautaire", "vatNumber"],
              ["RCS", "rcs"],
              ["Capital social (€)", "capital"],
              ["Code APE", "ape"],
              ["IBAN / Coordonnées bancaires", "bankDetails"],
            ] as [string, keyof BillingDocument["issuer"]][]).map(([l, k]) => (
              <div key={k}>
                <label className={labelCls}>{l}</label>
                <input value={(doc.issuer as any)[k] || ""} onChange={e => updIssuer({ [k]: e.target.value })} className={inputCls} />
              </div>
            ))}
          </div>
        </div>

        {/* Client */}
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-landes-pine text-sm">Client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prénom *</label>
              <input value={doc.client.firstName || ""} onChange={e => updClient({ firstName: e.target.value })} disabled={isReadonly} className={inputCls} placeholder="Jean" />
            </div>
            <div>
              <label className={labelCls}>Nom *</label>
              <input value={doc.client.lastName || ""} onChange={e => updClient({ lastName: e.target.value })} disabled={isReadonly} className={inputCls} placeholder="Dupont" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Entreprise / Raison sociale <span className="text-gray-400 font-normal">(facultatif)</span></label>
              <input value={doc.client.company || ""} onChange={e => updClient({ company: e.target.value })} disabled={isReadonly} className={inputCls} placeholder="SARL Exemple" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Adresse</label>
              <input value={doc.client.address || ""} onChange={e => updClient({ address: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Code postal</label>
              <input value={doc.client.postalCode || ""} onChange={e => updClient({ postalCode: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input value={doc.client.city || ""} onChange={e => updClient({ city: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={doc.client.email || ""} onChange={e => updClient({ email: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input value={doc.client.phone || ""} onChange={e => updClient({ phone: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SIRET</label>
              <input value={doc.client.siret || ""} onChange={e => updClient({ siret: e.target.value })} disabled={isReadonly} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>N° TVA intracommunautaire</label>
              <input value={doc.client.vatNumber || ""} onChange={e => updClient({ vatNumber: e.target.value })} disabled={isReadonly} className={inputCls} placeholder="FR00123456789" />
            </div>
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-landes-pine text-sm">Lignes</h3>
          {!isReadonly && (
            <button onClick={addLine} className="flex items-center gap-1.5 text-sm text-landes-forest hover:text-landes-pine transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {["Description", "Qté", "Unité", "PU HT (€)", "TVA %", "Total HT", ""].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium text-gray-500 pr-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-2">
              {doc.lines.map((l, idx) => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="py-2 pr-2 w-1/3">
                    <input value={l.description} onChange={e => updLine(l.id, { description: e.target.value })}
                      placeholder="Description de la prestation…" className={inputCls} />
                  </td>
                  <td className="py-2 pr-2 w-16">
                    <input type="number" min="0" step="0.01" value={l.quantity}
                      onChange={e => updLine(l.id, { quantity: parseFloat(e.target.value) || 0 })} className={inputCls} />
                  </td>
                  <td className="py-2 pr-2 w-24">
                    <select value={l.unit} onChange={e => updLine(l.id, { unit: e.target.value })} className={inputCls}>
                      {["unité","h","jour","forfait","m","m²","kg","lot"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2 w-28">
                    <input type="number" min="0" step="0.01" value={l.unitPrice}
                      onChange={e => updLine(l.id, { unitPrice: parseFloat(e.target.value) || 0 })} className={inputCls} />
                  </td>
                  <td className="py-2 pr-2 w-20">
                    <select value={l.vatRate} onChange={e => updLine(l.id, { vatRate: parseFloat(e.target.value) })} className={inputCls}>
                      {VAT_RATES.map(r => <option key={r} value={r}>{r} %</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2 text-right font-semibold text-landes-pine whitespace-nowrap">
                    {fmt(l.quantity * l.unitPrice)} €
                  </td>
                  <td className="py-2">
                    {doc.lines.length > 1 && (
                      <button onClick={() => removeLine(l.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total HT</span><span className="font-semibold">{fmt(t.totalHT)} €</span></div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 flex-1">Remise (%)</span>
              <input type="number" min="0" max="100" step="0.5" value={doc.discountPct || 0}
                onChange={e => upd({ discountPct: parseFloat(e.target.value) || 0 })}
                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm text-right" />
              <span className="text-red-500 text-sm">−{fmt(t.discount)} €</span>
            </div>
            {(doc.discountPct ?? 0) > 0 && (
              <div className="flex justify-between text-sm"><span className="text-gray-500">HT après remise</span><span>{fmt(t.htAfter)} €</span></div>
            )}
            {Object.entries(t.vatMap).map(([rate, amt]) => (
              <div key={rate} className="flex justify-between text-sm text-gray-500">
                <span>TVA {rate}%</span>
                <span>{fmt(amt * (1 - (doc.discountPct ?? 0) / 100))} €</span>
              </div>
            ))}
            <div className="flex justify-between bg-landes-pine text-white px-4 py-2.5 rounded-xl">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-lg">{fmt(t.totalTTC)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes et conditions */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-landes-pine text-sm">Conditions et mentions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Notes / Observations</label>
            <textarea value={doc.notes || ""} onChange={e => upd({ notes: e.target.value })}
              rows={3} className={`${inputCls} resize-none`} placeholder="Conditions particulières, détails…" />
          </div>
          {doc.type !== "devis" && (
            <div>
              <label className={labelCls}>Conditions de paiement</label>
              <input value={doc.paymentTerms || ""} onChange={e => upd({ paymentTerms: e.target.value })} className={inputCls} />
            </div>
          )}
          <div>
            <label className={labelCls}>Mode de paiement</label>
            <select value={doc.paymentMethod || ""} onChange={e => upd({ paymentMethod: e.target.value })} disabled={isReadonly} className={inputCls}>
              {["À définir","Virement bancaire","Chèque","Carte bancaire","Espèces","Prélèvement"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>IBAN / Coordonnées bancaires</label>
            <textarea value={doc.bankDetails || ""} onChange={e => upd({ bankDetails: e.target.value })}
              rows={3} className={`${inputCls} resize-none`} placeholder="IBAN : FR76…&#10;BIC : …" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Pénalités de retard (mention légale obligatoire sur factures)</label>
            <input value={doc.penalty || ""} onChange={e => upd({ penalty: e.target.value })} disabled={isReadonly} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Indemnité forfaitaire recouvrement (art. L.441-10)</label>
            <input value={doc.recoveryFee || ""} onChange={e => upd({ recoveryFee: e.target.value })} disabled={isReadonly} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Boutons bas de page */}
      <div className="flex items-center justify-between pt-2 pb-4 border-t border-gray-100">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2.5 px-5">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
        <div className="flex gap-3">
          <button onClick={() => setPreview(true)} className="btn-secondary flex items-center gap-2 py-2.5 px-5">
            <Eye className="w-4 h-4" /> Aperçu
          </button>
          {!isReadonly && (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              {saved
                ? <><CheckCircle className="w-4 h-4" /> Enregistré</>
                : <><Save className="w-4 h-4" /> Enregistrer</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main FacturationTab ──────────────────────────────────────────────────────
export default function FacturationTab({ pro, infoOnly = false, docsOnly = false, autoEditProfile = false, onEditProfileOpen }: { pro: Professional; infoOnly?: boolean; docsOnly?: boolean; autoEditProfile?: boolean; onEditProfileOpen?: () => void }) {
  const [docs, setDocs]       = useState<BillingDocument[]>([]);
  const [editing, setEditing] = useState<BillingDocument | null>(null);
  const [preview, setPreview] = useState<BillingDocument | null>(null);
  const [filter, setFilter]   = useState<DocumentType | "tous">("tous");
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [profileForm, setProfileForm] = useState<BillingProfile | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsLoadError, setDocsLoadError] = useState(false);

  // ── Étape 5 de la migration base de données ──
  // Charge en priorité depuis la base (devis/factures accessibles depuis
  // n'importe quel appareil), avec repli automatique et silencieux sur
  // localStorage si la base est indisponible ou pas encore alimentée pour
  // ce professionnel.
  const load = async () => {
    setDocsLoading(true);
    setDocsLoadError(false);

    let allDocs: BillingDocument[] | null = null;
    try {
      const res = await fetch(`/api/db/documents?proId=${encodeURIComponent(pro.id)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.documents) && json.documents.length > 0) allDocs = json.documents;
      }
    } catch {
      // Réseau indisponible ou base non configurée : repli silencieux ci-dessous
    }

    if (!allDocs) {
      try {
        allDocs = getDocumentsByPro(pro.id);
      } catch {
        setDocsLoadError(true);
        setDocsLoading(false);
        return;
      }
    }

    setDocs(allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setDocsLoading(false);
  };

  useEffect(() => {
    load();
    const p = getBillingProfile(pro.id);
    if (p) { setProfile(p); setProfileForm(p); }
    else {
      const defaultProfile: BillingProfile = {
        proId: pro.id,
        companyName:  pro.companyName,
        legalForm:    pro.legalForm,
        siren:        pro.siren,
        siret:        "",
        rcs:          `RCS ${pro.city}`,
        rm:           "",
        capital:      "",
        ape:          "",
        vatNumber:    "",
        vatSubject:   false,
        address:      pro.address,
        postalCode:   pro.postalCode,
        city:         pro.city,
        email:        pro.email,
        phone:        pro.phone,
        website:      pro.website || "",
        bankDetails:  "",
        paymentTerms: "30 jours date de facture",
        penalty:      "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
        recoveryFee:  "40 € (indemnité forfaitaire pour frais de recouvrement, art. L.441-10 C.com.)",
      };
      setProfileForm(defaultProfile);
    }
  }, [pro.id]);

  const handleNew = (type: DocumentType) => {
    const doc = makeDoc(pro, type, profile);
    const num = getNextNumber(pro.id, type);
    setEditing({ ...doc, number: num });
  };

  // Auto-ouvre le mode édition si déclenché depuis la nav
  useEffect(() => {
    if (autoEditProfile) {
      setProfileEditing(true);
      onEditProfileOpen?.();
    }
  }, [autoEditProfile]);

  const handleSaveProfile = () => {
    if (!profileForm) return;

    const errs: Record<string, string> = {};
    const isAutoOrEI = profileForm.legalForm === "Auto-entrepreneur" || profileForm.legalForm === "EI";
    if (!isAutoOrEI && !profileForm.capital?.trim()) errs.capital = "Le capital social est requis pour cette forme juridique.";
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    saveBillingProfile(profileForm);
    setProfile(profileForm);
    setProfileSaved(true);
    setProfileEditing(false);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const updProfile = (patch: Partial<BillingProfile>) =>
    setProfileForm(p => p ? { ...p, ...patch } : p);

  const handleSave = (doc: BillingDocument) => {
    saveDocument(doc);

    // Sync client CRM — uniquement si prénom ou nom renseigné
    const { firstName, lastName, company, email, phone, address, postalCode, city, siret, vatNumber } = doc.client;
    if (firstName?.trim() || lastName?.trim()) {
      const all = getClients();
      // Recherche doublon : même proId + (email OU (prénom+nom+entreprise))
      const existing = all.find(c =>
        c.proId === pro.id && (
          (email && c.email?.toLowerCase() === email.toLowerCase()) ||
          (c.firstName.toLowerCase() === (firstName || "").toLowerCase() &&
           c.lastName.toLowerCase()  === (lastName  || "").toLowerCase() &&
           (c.company || "").toLowerCase() === (company || "").toLowerCase())
        )
      );

      if (existing) {
        // Mise à jour silencieuse des infos manquantes
        saveClient({
          ...existing,
          email:      email      || existing.email,
          phone:      phone      || existing.phone,
          address:    address    || existing.address,
          postalCode: postalCode || existing.postalCode,
          city:       city       || existing.city,
          siret:      siret      || existing.siret,
          vatNumber:  vatNumber  || existing.vatNumber,
          company:    company    || existing.company,
          updatedAt:  new Date().toISOString(),
        });
      } else {
        const newClient: Client = {
          id: generateId(), proId: pro.id,
          firstName: firstName || "",
          lastName:  lastName  || "",
          company:   company   || "",
          email:     email     || "",
          phone:     phone     || "",
          mobile:    "",
          address:   address   || "",
          postalCode: postalCode || "",
          city:      city      || "",
          siret:     siret     || "",
          vatNumber: vatNumber || "",
          status:    "actif",
          source:    "Facturation",
          tags:      [],
          notes:     [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveClient(newClient);
      }
    }

    load();
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    deleteDocument(id);
    load();
  };

  const handleDuplicate = (doc: BillingDocument) => {
    const num  = getNextNumber(pro.id, doc.type);
    const copy = { ...doc, id: generateId(), number: num, status: "brouillon" as DocumentStatus,
      issueDate: today(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveDocument(copy);
    load();
  };

  const convertToInvoice = (doc: BillingDocument) => {
    const num = getNextNumber(pro.id, "facture");
    const inv: BillingDocument = {
      ...doc, id: generateId(), type: "facture",
      number: num, status: "brouillon", linkedTo: doc.id,
      dueDate: addDays(today(), 30), validityDate: undefined,
      issueDate: today(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setEditing(inv);
  };

  const createAvoir = (doc: BillingDocument) => {
    const num = getNextNumber(pro.id, "avoir");
    const avoir: BillingDocument = {
      ...doc, id: generateId(), type: "avoir",
      number: num, status: "brouillon", linkedTo: doc.id,
      lines: doc.lines.map(l => ({ ...l, unitPrice: -Math.abs(l.unitPrice) })),
      issueDate: today(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setEditing(avoir);
  };

  if (editing) return <DocEditor doc={editing} onSave={handleSave} onBack={() => { setEditing(null); load(); }} />;

  const filtered = filter === "tous" ? docs : docs.filter(d => d.type === filter);
  const stats = {
    devis:   docs.filter(d => d.type === "devis").length,
    facture: docs.filter(d => d.type === "facture").length,
    avoir:   docs.filter(d => d.type === "avoir").length,
    ca: docs.filter(d => d.type === "facture" && d.status === "payé")
      .reduce((s, d) => s + calcTotals(d.lines, d.discountPct).totalTTC, 0),
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      {preview && <PrintPreview doc={preview} onClose={() => setPreview(null)} />}

      {/* ── Informations de facturation ── */}
      {!docsOnly && (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-landes-pine bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Informations de facturation</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ces informations apparaîtront automatiquement dans la section "Émetteur" de vos documents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Enregistré
              </span>
            )}
            {!profileEditing
              ? <button onClick={() => { setProfileEditing(true); setProfileErrors({}); }} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                  <Edit3 className="w-3.5 h-3.5" /> Modifier
                </button>
              : <div className="flex gap-2">
                  <button onClick={() => { setProfileEditing(false); setProfileForm(profile); setProfileErrors({}); }} className="btn-secondary py-1.5 px-3 text-sm">Annuler</button>
                  <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2 py-1.5 px-3 text-sm">
                    <Save className="w-3.5 h-3.5" /> Enregistrer
                  </button>
                </div>
            }
          </div>
        </div>

        {profileForm && (
          <div className="space-y-6">
            {/* Identification légale */}
            <div>
              <h3 className="text-sm font-semibold text-landes-pine mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center text-landes-forest text-[10px] font-bold">1</span>
                Identification légale
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Dénomination sociale / Nom &amp; Prénom *</label>
                  {profileEditing
                    ? <input value={profileForm.companyName} onChange={e => updProfile({ companyName: e.target.value })} className={inputCls} placeholder="Ma Société SARL" />
                    : <p className="text-sm text-gray-800 font-medium py-2">{profileForm.companyName || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Forme juridique *</label>
                  {profileEditing
                    ? <select value={profileForm.legalForm} onChange={e => updProfile({ legalForm: e.target.value })} className={inputCls}>
                        {["Auto-entrepreneur","EI","EURL","SARL","SAS","SASU","SA","SCP","SNC","Association","Autre"].map(f => <option key={f}>{f}</option>)}
                      </select>
                    : <p className="text-sm text-gray-800 py-2">{profileForm.legalForm || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>SIREN * <span className="text-gray-400 font-normal">(9 chiffres)</span></label>
                  {profileEditing
                    ? <input value={profileForm.siren} onChange={e => updProfile({ siren: e.target.value })} className={inputCls} placeholder="123 456 789" maxLength={11} />
                    : <p className="text-sm text-gray-800 py-2 font-mono">{profileForm.siren || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>SIRET <span className="text-gray-400 font-normal">(14 chiffres)</span></label>
                  {profileEditing
                    ? <input value={profileForm.siret || ""} onChange={e => updProfile({ siret: e.target.value })} className={inputCls} placeholder="123 456 789 00012" maxLength={17} />
                    : <p className="text-sm text-gray-800 py-2 font-mono">{profileForm.siret || <span className="text-gray-400 italic">Facultatif</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Code APE / NAF</label>
                  {profileEditing
                    ? <input value={profileForm.ape || ""} onChange={e => updProfile({ ape: e.target.value })} className={inputCls} placeholder="6201Z" />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.ape || <span className="text-gray-400 italic">Facultatif</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>RCS <span className="text-gray-400 font-normal">(commerçants)</span></label>
                  {profileEditing
                    ? <>
                        <input value={profileForm.rcs || ""} onChange={e => { updProfile({ rcs: e.target.value }); setProfileErrors(p => ({ ...p, rcs: "" })); }} className={`${inputCls} ${profileErrors.rcs ? "border-red-400" : ""}`} placeholder="RCS Mont-de-Marsan B 123 456 789" />
                        {profileErrors.rcs && <p className="text-red-500 text-xs mt-1">{profileErrors.rcs}</p>}
                      </>
                    : <p className="text-sm text-gray-800 py-2">{profileForm.rcs || <span className="text-gray-400 italic">Facultatif</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Répertoire des métiers (RM) <span className="text-gray-400 font-normal">(artisans)</span></label>
                  {profileEditing
                    ? <>
                        <input value={profileForm.rm || ""} onChange={e => { updProfile({ rm: e.target.value }); setProfileErrors(p => ({ ...p, rm: "" })); }} className={`${inputCls} ${profileErrors.rm ? "border-red-400" : ""}`} placeholder="RM 123 456 789 00012" />
                        {profileErrors.rm && <p className="text-red-500 text-xs mt-1">{profileErrors.rm}</p>}
                      </>
                    : <p className="text-sm text-gray-800 py-2">{profileForm.rm || <span className="text-gray-400 italic">Facultatif</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>
                    Capital social {!(profileForm.legalForm === "Auto-entrepreneur" || profileForm.legalForm === "EI") && "*"}
                    <span className="text-gray-400 font-normal"> {(profileForm.legalForm === "Auto-entrepreneur" || profileForm.legalForm === "EI") ? "(non applicable)" : "(SARL/SAS)"}</span>
                  </label>
                  {profileEditing
                    ? <>
                        <input
                          value={profileForm.capital || ""}
                          onChange={e => { updProfile({ capital: e.target.value }); setProfileErrors(p => ({ ...p, capital: "" })); }}
                          disabled={profileForm.legalForm === "Auto-entrepreneur" || profileForm.legalForm === "EI"}
                          className={`${inputCls} ${profileErrors.capital ? "border-red-400" : ""} disabled:bg-gray-50 disabled:text-gray-400`}
                          placeholder="10 000"
                        />
                        {profileErrors.capital && <p className="text-red-500 text-xs mt-1">{profileErrors.capital}</p>}
                      </>
                    : <p className="text-sm text-gray-800 py-2">{profileForm.capital ? `${profileForm.capital} €` : <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
              </div>
            </div>

            {/* TVA */}
            <div>
              <h3 className="text-sm font-semibold text-landes-pine mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center text-landes-forest text-[10px] font-bold">2</span>
                TVA
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    {profileEditing
                      ? <input type="checkbox" checked={profileForm.vatSubject} onChange={e => updProfile({ vatSubject: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-landes-forest focus:ring-landes-sage" />
                      : <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${profileForm.vatSubject ? "bg-landes-forest border-landes-forest" : "border-gray-300"}`}>
                          {profileForm.vatSubject && <span className="text-white text-[10px]">✓</span>}
                        </div>
                    }
                    <span className="text-sm text-gray-700">Assujetti à la TVA</span>
                  </label>
                </div>
                {(profileForm.vatSubject || profileForm.vatNumber) && (
                  <div>
                    <label className={labelCls}>N° TVA intracommunautaire *</label>
                    {profileEditing
                      ? <input value={profileForm.vatNumber || ""} onChange={e => updProfile({ vatNumber: e.target.value })} className={inputCls} placeholder="FR00123456789" />
                      : <p className="text-sm text-gray-800 py-2 font-mono">{profileForm.vatNumber || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                  </div>
                )}
                {!profileForm.vatSubject && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 italic">
                      TVA non applicable, art. 293 B du Code général des impôts — cette mention sera ajoutée automatiquement sur vos documents.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <h3 className="text-sm font-semibold text-landes-pine mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center text-landes-forest text-[10px] font-bold">3</span>
                Coordonnées
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Adresse *</label>
                  {profileEditing
                    ? <input value={profileForm.address} onChange={e => updProfile({ address: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.address}</p>}
                </div>
                <div>
                  <label className={labelCls}>Code postal *</label>
                  {profileEditing
                    ? <input value={profileForm.postalCode} onChange={e => updProfile({ postalCode: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.postalCode}</p>}
                </div>
                <div>
                  <label className={labelCls}>Ville *</label>
                  {profileEditing
                    ? <input value={profileForm.city} onChange={e => updProfile({ city: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.city}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  {profileEditing
                    ? <input type="email" value={profileForm.email} onChange={e => updProfile({ email: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Téléphone *</label>
                  {profileEditing
                    ? <input value={profileForm.phone} onChange={e => updProfile({ phone: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.phone}</p>}
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div>
              <h3 className="text-sm font-semibold text-landes-pine mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center text-landes-forest text-[10px] font-bold">4</span>
                Paiement &amp; mentions légales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>IBAN / Coordonnées bancaires</label>
                  {profileEditing
                    ? <textarea value={profileForm.bankDetails || ""} onChange={e => updProfile({ bankDetails: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder={"IBAN : FR76 3000 6000 0112 3456 7890 189\nBIC : BNPAFRPPXXX"} />
                    : <p className="text-sm text-gray-800 py-2 whitespace-pre-line">{profileForm.bankDetails || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Conditions de règlement</label>
                  {profileEditing
                    ? <input value={profileForm.paymentTerms || ""} onChange={e => updProfile({ paymentTerms: e.target.value })} className={inputCls} placeholder="30 jours date de facture" />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.paymentTerms || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Pénalités de retard <span className="text-gray-400 font-normal">(mention légale obligatoire)</span></label>
                  {profileEditing
                    ? <input value={profileForm.penalty || ""} onChange={e => updProfile({ penalty: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.penalty || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Indemnité forfaitaire recouvrement <span className="text-gray-400 font-normal">(art. L.441-10 C.com.)</span></label>
                  {profileEditing
                    ? <input value={profileForm.recoveryFee || ""} onChange={e => updProfile({ recoveryFee: e.target.value })} className={inputCls} />
                    : <p className="text-sm text-gray-800 py-2">{profileForm.recoveryFee || <span className="text-gray-400 italic">Non renseigné</span>}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ── Devis, Factures & Avoirs + Filter + list ── */}
      {!infoOnly && (<>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-landes-pine bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Devis, Factures &amp; Avoirs</h2>
            <p className="text-sm text-gray-500">Documents aux normes françaises (art. L441-9 C.com.)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["devis","facture","avoir"] as const).map(type => (
              <button key={type} onClick={() => handleNew(type)}
                className="flex items-center gap-1.5 btn-primary py-2 px-3 text-sm">
                <Plus className="w-3.5 h-3.5" /> {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Devis",     value: stats.devis,   color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Factures",  value: stats.facture, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Avoirs",    value: stats.avoir,   color: "text-orange-600", bg: "bg-orange-50" },
            { label: "CA encaissé (TTC)", value: `${fmt(stats.ca)} €`, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + list */}
      <div className="card p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["tous","devis","facture","avoir"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {f === "tous" ? `Tous (${docs.length})` : `${TYPE_LABELS[f as DocumentType]} (${docs.filter(d=>d.type===f).length})`}
            </button>
          ))}
        </div>

        {docsLoadError ? (
          <div className="text-center py-10">
            <p className="font-medium text-landes-pine mb-1">Impossible de charger vos documents</p>
            <p className="text-sm text-gray-500 mb-4">Vérifiez votre connexion internet et réessayez.</p>
            <button onClick={() => load()} className="btn-primary inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : docsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-landes-forest" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun document</p>
            <p className="text-sm mt-1">Créez votre premier {filter === "tous" ? "document" : TYPE_LABELS[filter as DocumentType].toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => {
              const t = calcTotals(doc.lines, doc.discountPct);
              const st = STATUS_LABELS[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-landes-sage/40 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-landes-pine">{doc.number}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{TYPE_LABELS[doc.type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      {doc.linkedTo && <span className="text-xs text-gray-400 italic">lié</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{[doc.client.firstName, doc.client.lastName].filter(Boolean).join(" ") || doc.client.company || doc.client.name || "Client non renseigné"} · {fmtDate(doc.issueDate)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-landes-pine text-sm">{fmt(t.totalTTC)} € TTC</p>
                    <p className="text-xs text-gray-400">{fmt(t.htAfter)} € HT</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setPreview(doc)} title="Aperçu" className="p-1.5 rounded hover:bg-landes-forest/10 text-gray-500 hover:text-landes-forest transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(doc)} title="Modifier" className="p-1.5 rounded hover:bg-landes-forest/10 text-gray-500 hover:text-landes-forest transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDuplicate(doc)} title="Dupliquer" className="p-1.5 rounded hover:bg-landes-forest/10 text-gray-500 hover:text-landes-forest transition-colors"><Copy className="w-4 h-4" /></button>
                    {doc.type === "devis" && (
                      <button onClick={() => convertToInvoice(doc)} title="Convertir en facture" className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"><ArrowRight className="w-4 h-4" /></button>
                    )}
                    {doc.type === "facture" && doc.status === "payé" && (
                      <button onClick={() => createAvoir(doc)} title="Créer un avoir" className="p-1.5 rounded hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => handleDelete(doc.id)} title="Supprimer" className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>)}
    </div>
  );
}
