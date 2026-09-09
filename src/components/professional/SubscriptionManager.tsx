"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { CreditCard, Loader2, XCircle, X, Calendar } from "lucide-react";
import StripePaymentForm from "./StripePaymentForm";
import InvoicesPanel from "./InvoicesPanel";

export interface SubscriptionManagerHandle {
  refresh: () => void;
  openCardModal: () => void;
}

interface SubscriptionItem {
  itemId: string;
  name: string;
  amount: number | null;
  interval?: string;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  items: SubscriptionItem[];
  defaultPaymentMethod: { brand: string; last4: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:             { label: "Actif",              color: "bg-green-100 text-green-700" },
  trialing:           { label: "Période d'essai",    color: "bg-blue-100 text-blue-700" },
  past_due:           { label: "Paiement en retard",  color: "bg-orange-100 text-orange-700" },
  canceled:           { label: "Résilié",             color: "bg-red-100 text-red-600" },
  unpaid:             { label: "Impayé",              color: "bg-red-100 text-red-600" },
};

const SubscriptionManager = forwardRef<SubscriptionManagerHandle, { customerId: string }>(function SubscriptionManager({ customerId }, ref) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardClientSecret, setCardClientSecret] = useState<string | null>(null);
  const [preparingCard, setPreparingCard] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/subscriptions/list?customerId=${encodeURIComponent(customerId)}`);
      const data = await res.json();
      if (data.error) {
        setLoadError(data.error);
        setSubs([]);
        return;
      }
      // Les abonnements "incomplet" / "expiré" (paiement jamais finalisé) ne sont pas affichés
      const filtered = (data.subscriptions || []).filter(
        (s: Subscription) => s.status !== "incomplete" && s.status !== "incomplete_expired"
      );
      setSubs(filtered);
    } catch {
      setLoadError("Erreur réseau lors du chargement de vos abonnements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [customerId]);

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm("Confirmer la résiliation de cet abonnement ? Il restera actif jusqu'à la fin de la période déjà payée.")) return;
    setCancellingId(subscriptionId);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      await load();
    } catch {
      alert("Erreur réseau lors de la résiliation.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemoveItem = async (subscriptionId: string, itemId: string, productName: string) => {
    if (!confirm(`Confirmer le retrait de "${productName}" ? Les autres produits de cet abonnement resteront actifs.`)) return;
    setRemovingItemId(itemId);
    try {
      const res = await fetch("/api/subscriptions/remove-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, itemId }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      await load();
    } catch {
      alert("Erreur réseau lors du retrait de ce produit.");
    } finally {
      setRemovingItemId(null);
    }
  };

  const openCardModal = async () => {
    setShowCardModal(true);
    setPreparingCard(true);
    try {
      const res = await fetch("/api/subscriptions/update-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.clientSecret) setCardClientSecret(data.clientSecret);
      else alert(data.error || "Erreur lors de la préparation du changement de carte.");
    } catch {
      alert("Erreur réseau.");
    } finally {
      setPreparingCard(false);
    }
  };

  const handleCardSuccess = async (paymentMethodId?: string) => {
    if (paymentMethodId) {
      await fetch("/api/subscriptions/confirm-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
          subscriptionId: subs[0]?.id, // met aussi à jour l'abonnement principal
        }),
      });
    }
    setShowCardModal(false);
    setCardClientSecret(null);
    await load();
  };

  useImperativeHandle(ref, () => ({
    refresh: load,
    openCardModal,
  }));

  return (
    <div className="mb-6">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement de vos abonnements…
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Erreur : {loadError}
        </p>
      ) : subs.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Aucun abonnement Stripe actif pour le moment.</p>
      ) : (
        <>
          {subs.filter(s => s.status === "active").length > 1 && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3">
              Vous avez plusieurs abonnements actifs — chacun peut être résilié indépendamment via son propre bouton ci-dessous.
            </p>
          )}
          {subs.some(s => s.items.length > 1) && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3">
              Un abonnement qui regroupe plusieurs produits peut être ajusté produit par produit (bouton « Retirer » à côté de chaque ligne), sans résilier les autres.
            </p>
          )}
          <div className="space-y-3">
          {subs.map(sub => {
            const statusInfo = STATUS_LABELS[sub.status] || { label: sub.status, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={sub.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                  {sub.cancelAtPeriodEnd && (
                    <span className="text-xs text-orange-600 font-medium">Résiliation programmée</span>
                  )}
                </div>
                <ul className="space-y-1.5 mb-3">
                  {sub.items.map((item) => (
                    <li key={item.itemId} className="flex items-center justify-between text-sm gap-2">
                      <span className="text-gray-700 min-w-0 truncate">{item.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-500 whitespace-nowrap">
                          {item.amount != null ? `${(item.amount / 100).toFixed(2)}€` : ""}
                          {item.interval ? `/${item.interval === "month" ? "mois" : item.interval}` : ""}
                        </span>
                        {sub.items.length > 1 && sub.status === "active" && !sub.cancelAtPeriodEnd && (
                          <button
                            onClick={() => handleRemoveItem(sub.id, item.itemId, item.name)}
                            disabled={removingItemId === item.itemId}
                            title={`Retirer uniquement "${item.name}"`}
                            className="text-[10px] font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {removingItemId === item.itemId ? "…" : "Retirer"}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {sub.currentPeriodEnd && (sub.status === "active" || sub.status === "trialing") && (
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {sub.cancelAtPeriodEnd
                      ? <>Se termine le <strong className="text-gray-700">{new Date(sub.currentPeriodEnd * 1000).toLocaleDateString("fr-FR")}</strong></>
                      : <>Renouvellement le <strong className="text-gray-700">{new Date(sub.currentPeriodEnd * 1000).toLocaleDateString("fr-FR")}</strong></>
                    }
                  </p>
                )}
                {sub.defaultPaymentMethod && (
                  <p className="text-xs text-gray-400 mb-3">
                    Carte enregistrée : {sub.defaultPaymentMethod.brand?.toUpperCase()} •••• {sub.defaultPaymentMethod.last4}
                  </p>
                )}
                {sub.status === "active" && !sub.cancelAtPeriodEnd && (
                  <button
                    onClick={() => handleCancel(sub.id)}
                    disabled={cancellingId === sub.id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === sub.id
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Résiliation…</>
                      : <><XCircle className="w-3.5 h-3.5" /> {sub.items.length > 1 ? "Résilier tout cet abonnement" : "Résilier cet abonnement"}</>
                    }
                  </button>
                )}
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Modale changement de carte */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onClick={() => setShowCardModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-landes-pine">Mettre à jour ma carte bancaire</p>
              <button onClick={() => setShowCardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {preparingCard || !cardClientSecret ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Préparation…
              </div>
            ) : (
              <StripePaymentForm
                clientSecret={cardClientSecret}
                intentType="setup"
                submitLabel="Enregistrer cette carte"
                onSuccess={handleCardSuccess}
              />
            )}
          </div>
        </div>
      )}

      {/* Mes factures */}
      <InvoicesPanel customerId={customerId} />
    </div>
  );
});

export default SubscriptionManager;
