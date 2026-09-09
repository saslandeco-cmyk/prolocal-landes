"use client";
import { useEffect, useState } from "react";
import { FileText, Download, Mail, Loader2, RefreshCw, X, CheckCircle } from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  subscriptionId: string | null;
  hostedInvoiceUrl: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:         { label: "Payée",       color: "bg-green-100 text-green-700" },
  open:         { label: "En attente",  color: "bg-orange-100 text-orange-700" },
  draft:        { label: "Brouillon",   color: "bg-gray-100 text-gray-600" },
  uncollectible:{ label: "Impayée",     color: "bg-red-100 text-red-600" },
  void:         { label: "Annulée",     color: "bg-gray-100 text-gray-500" },
};

export default function InvoicesPanel({ customerId }: { customerId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailModalFor, setEmailModalFor] = useState<string | null>(null);
  const [emailsInput, setEmailsInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ demo: boolean; recipients: string[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/invoices/list?customerId=${encodeURIComponent(customerId)}`);
      const data = await res.json();
      if (data.error) { setLoadError(data.error); setInvoices([]); return; }
      setInvoices(data.invoices || []);
    } catch {
      setLoadError("Erreur réseau lors du chargement de vos factures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [customerId]);

  const downloadFacturX = (invoiceId: string) => {
    // Téléchargement direct : le navigateur suit le lien et enregistre le fichier
    // renvoyé avec l'en-tête Content-Disposition: attachment par la route API.
    window.location.href = `/api/invoices/facturx?invoiceId=${encodeURIComponent(invoiceId)}`;
  };

  const openEmailModal = (invoiceId: string) => {
    setEmailModalFor(invoiceId);
    setEmailsInput("");
    setSendResult(null);
  };

  const handleSendXml = async () => {
    if (!emailModalFor) return;
    const emails = emailsInput.split(/[,;\s]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) { alert("Veuillez saisir au moins une adresse email."); return; }

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/invoices/send-xml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: emailModalFor, emails }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setSendResult({ demo: Boolean(data.demo), recipients: data.recipients || emails });
    } catch {
      alert("Erreur réseau lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Mes factures
        </p>
        <button onClick={load} className="text-xs text-gray-400 hover:text-landes-forest flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Actualiser
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Téléchargez vos factures au format Factur-X (PDF avec fichier XML structuré embarqué), ou envoyez le fichier XML par email.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement de vos factures…
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Erreur : {loadError}
        </p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Aucune facture pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const statusInfo = STATUS_LABELS[inv.status || ""] || { label: inv.status || "—", color: "bg-gray-100 text-gray-600" };
            return (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-100 rounded-xl p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{inv.number || inv.id}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.created * 1000).toLocaleDateString("fr-FR")} — {(inv.amountPaid || inv.amountDue) / 100}€
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => downloadFacturX(inv.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-landes-forest border border-landes-forest/40 px-3 py-1.5 rounded-lg hover:bg-landes-forest hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF + XML
                  </button>
                  <button
                    onClick={() => openEmailModal(inv.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Envoyer (XML)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale envoi par email */}
      {emailModalFor && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onClick={() => setEmailModalFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-landes-pine">Envoyer la facture (XML)</p>
              <button onClick={() => setEmailModalFor(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendResult ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      {sendResult.demo ? "Simulation d'envoi réussie" : "Email envoyé"}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Destinataire(s) : {sendResult.recipients.join(", ")}
                    </p>
                  </div>
                </div>
                {sendResult.demo && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Mode démonstration — aucun service d&apos;envoi d&apos;email n&apos;est configuré (RESEND_API_KEY). Aucun email n&apos;a réellement été envoyé.
                  </p>
                )}
                <button onClick={() => setEmailModalFor(null)} className="btn-secondary w-full py-2 text-sm">Fermer</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Adresse(s) email <span className="text-gray-400">(séparées par une virgule)</span></label>
                  <textarea
                    value={emailsInput}
                    onChange={e => setEmailsInput(e.target.value)}
                    rows={2}
                    className="input-field text-sm resize-none"
                    placeholder="comptable@entreprise.fr, contact@entreprise.fr"
                  />
                </div>
                <button
                  onClick={handleSendXml}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-landes-forest text-white font-semibold py-2.5 rounded-xl hover:bg-landes-pine transition-colors disabled:opacity-50"
                >
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Mail className="w-4 h-4" /> Envoyer le fichier XML</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
