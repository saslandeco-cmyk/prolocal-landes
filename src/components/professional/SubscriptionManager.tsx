"use client";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, XCircle, RefreshCw, X } from "lucide-react";
import StripePaymentForm from "./StripePaymentForm";

interface SubscriptionItem {
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
  incomplete:         { label: "Incomplet",           color: "bg-gray-100 text-gray-600" },
  incomplete_expired: { label: "Expiré",              color: "bg-gray-100 text-gray-600" },
  canceled:           { label: "Résilié",             color: "bg-red-100 text-red-600" },
  unpaid:             { label: "Impayé",              color: "bg-red-100 text-red-600" },
};

export default function SubscriptionManager({ customerId }: { customerId: string }) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardClientSecret, setCardClientSecret] = useState<string | null>(null);
  const [preparingCard, setPreparingCard] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/list?customerId=${encodeURIComponent(customerId)}`);
      const data = await res.json();
      setSubs(data.subscriptions || []);
    } catch {
      // silencieux — l'utilisateur peut réessayer via le bouton Actualiser
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

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Mes abonnements Stripe</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-xs text-gray-400 hover:text-landes-forest flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Actualiser
          </button>
          <button
            onClick={openCardModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-landes-forest border border-landes-forest/40 px-3 py-1.5 rounded-lg hover:bg-landes-forest hover:text-white transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" /> Changer de carte
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement de vos abonnements…
        </div>
      ) : subs.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Aucun abonnement Stripe actif pour le moment.</p>
      ) : (
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
                <ul className="space-y-1 mb-3">
                  {sub.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500">
                        {item.amount != null ? `${(item.amount / 100).toFixed(2)}€` : ""}
                        {item.interval ? `/${item.interval === "month" ? "mois" : item.interval}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                {sub.currentPeriodEnd && (
                  <p className="text-xs text-gray-400 mb-2">
                    Prochaine échéance : {new Date(sub.currentPeriodEnd * 1000).toLocaleDateString("fr-FR")}
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
                      : <><XCircle className="w-3.5 h-3.5" /> Résilier cet abonnement</>
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
    </div>
  );
}
