"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Users, CheckCircle, Clock, XCircle, Trash2, Eye, EyeOff, Search, Filter, Edit3, Save, X, Loader2, Shield, Star, Flag, MessageSquare } from "lucide-react";
import { checkAdminCredentials, setSession, getSession, clearSession, getProfessionals, saveProfessional, deleteProfessional, getReviews, saveReview, deleteReview } from "@/lib/storage";
import { Professional, CATEGORIES, PLANS, StatusType, Review } from "@/types";
import PlanBadge from "@/components/ui/PlanBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import HeroImage from "@/components/ui/HeroImage";

// Bouton "Enregistrer" pour la photo hero — lit l'état depuis le storage
function HeroSaveButton() {
  const [saved, setSaved] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    const { getHeroImage } = require("@/lib/storage");
    setHasImage(!!getHeroImage());
    // Écoute les changements de localStorage
    const onStorage = () => setHasImage(!!getHeroImage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <button
      onClick={handleSave}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
        saved
          ? "bg-green-500 text-white"
          : "bg-landes-forest text-white hover:bg-landes-pine"
      }`}
    >
      {saved ? (
        <><CheckCircle className="w-4 h-4" /> Enregistré</>
      ) : (
        <><Save className="w-4 h-4" /> Enregistrer les modifications</>
      )}
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pros, setPros] = useState<Professional[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminSection, setAdminSection] = useState<"pros" | "reviews" | "site">("pros");
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusType | "">("");
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Professional>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.type === "admin") {
      setAuthenticated(true);
      setPros(getProfessionals());
      setReviews(getReviews());
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminCredentials(loginEmail, loginPassword)) {
      setSession("admin");
      setAuthenticated(true);
      setPros(getProfessionals());
    } else {
      setLoginError("Identifiants incorrects.");
    }
  };

  const handleLogout = () => { clearSession(); setAuthenticated(false); router.push("/"); };

  const refresh = () => { setPros(getProfessionals()); setReviews(getReviews()); };

  const updateStatus = (id: string, status: StatusType) => {
    const pro = pros.find((p) => p.id === id);
    if (!pro) return;
    const updated = { ...pro, status, updatedAt: new Date().toISOString(), ...(status === "active" ? { validatedAt: new Date().toISOString() } : {}) };
    saveProfessional(updated);
    refresh();
    if (selectedPro?.id === id) setSelectedPro(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer définitivement cette fiche ?")) return;
    deleteProfessional(id);
    refresh();
    if (selectedPro?.id === id) setSelectedPro(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedPro) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = { ...selectedPro, ...editForm, updatedAt: new Date().toISOString() };
    saveProfessional(updated);
    refresh();
    setSelectedPro(updated);
    setEditMode(false);
    setSaving(false);
  };

  const filtered = pros.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.companyName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: pros.length,
    active: pros.filter((p) => p.status === "active").length,
    pending: pros.filter((p) => p.status === "pending").length,
    suspended: pros.filter((p) => p.status === "suspended").length,
  };

  // LOGIN FORM
  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-landes-pine rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-landes-pine">Administration</h1>
            <p className="text-gray-500 mt-1">Accès réservé aux gestionnaires</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email administrateur</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input-field" placeholder="admin@prolocal-landes.fr" required />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
              </div>
              {loginError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{loginError}</div>}
              <button type="submit" className="btn-primary w-full py-3.5">Se connecter</button>
            </form>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Accès démo :</p>
            <p>Email : <code className="bg-blue-100 px-1 rounded">admin@prolocal-landes.fr</code></p>
            <p>Mot de passe : <code className="bg-blue-100 px-1 rounded">Admin2024!</code></p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-landes-pine">Administration</h1>
          <p className="text-gray-500">Gestion des professionnels inscrits</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-landes-pine">Administration</h1>
          <p className="text-gray-500">Gestion des professionnels et des avis</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setAdminSection("pros")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${adminSection === "pros" ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <Users className="w-4 h-4" /> Professionnels
        </button>
        <button onClick={() => setAdminSection("reviews")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${adminSection === "reviews" ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <Star className="w-4 h-4" /> Avis
          {reviews.filter(r => r.status === "pending").length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {reviews.filter(r => r.status === "pending").length}
            </span>
          )}
          {reviews.filter(r => r.flagged && r.status !== "rejected").length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none flex items-center gap-0.5">
              <Flag className="w-2.5 h-2.5" />{reviews.filter(r => r.flagged && r.status !== "rejected").length}
            </span>
          )}
        </button>
        <button onClick={() => setAdminSection("site")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${adminSection === "site" ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <Shield className="w-4 h-4" /> Personnalisation
        </button>
      </div>

      {/* ── Section Personnalisation ── */}
      {adminSection === "site" && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-landes-pine">Photo hero</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Cette photo s'affiche dans la section d'accueil du site, à droite du texte principal.
                  Recommandé : 1 400 × 900 px, format paysage.
                </p>
              </div>
              <HeroSaveButton />
            </div>
            <div className="max-w-xl mt-5">
              <HeroImage editable />
            </div>
          </div>
        </div>
      )}

      {/* ── Section Avis ── */}
      {adminSection === "reviews" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            {(["all","pending","approved","rejected","flagged"] as const).map(f => (
              <button key={f} onClick={() => {}}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors capitalize">
                {f === "all" ? `Tous (${reviews.length})` : f === "pending" ? `En attente (${reviews.filter(r=>r.status==="pending").length})` : f === "approved" ? `Approuvés (${reviews.filter(r=>r.status==="approved").length})` : f === "rejected" ? `Rejetés (${reviews.filter(r=>r.status==="rejected").length})` : `Signalés (${reviews.filter(r=>r.flagged).length})`}
              </button>
            ))}
          </div>

          {reviews.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">Aucun avis reçu.</div>
          ) : (
            reviews.map(review => {
              const pro = pros.find(p => p.id === review.proId);
              return (
                <div key={review.id} className={`card p-6 space-y-4 border-l-4 ${
                  review.flagged ? "border-l-red-400" :
                  review.status === "approved" ? "border-l-green-400" :
                  review.status === "rejected" ? "border-l-gray-300" : "border-l-orange-400"
                }`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-landes-pine text-sm">{review.firstName} {review.lastName}</p>
                        <span className="text-gray-300">·</span>
                        <p className="text-xs text-gray-400">{review.email}</p>
                        {review.flagged && <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full"><Flag className="w-3 h-3"/>Signalé</span>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {pro ? <><span className="font-medium text-gray-600">{pro.companyName}</span> · </> : ""}
                        {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />)}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      review.status === "approved" ? "bg-green-100 text-green-700" :
                      review.status === "rejected" ? "bg-gray-100 text-gray-500" : "bg-orange-100 text-orange-600"
                    }`}>
                      {review.status === "approved" ? "✓ Approuvé" : review.status === "rejected" ? "✕ Rejeté" : "⏳ En attente"}
                    </span>
                  </div>

                  {/* Texte — éditable */}
                  {editReview?.id === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editReview.text}
                        onChange={e => setEditReview({ ...editReview, text: e.target.value })}
                        rows={3}
                        className="input-field resize-none text-sm w-full"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { saveReview(editReview); setReviews(getReviews()); setEditReview(null); }}
                          className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"><Save className="w-3 h-3"/>Enregistrer</button>
                        <button onClick={() => setEditReview(null)} className="btn-secondary py-1.5 px-3 text-xs">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">"{review.text}"</p>
                  )}

                  {/* Réponse pro si présente */}
                  {review.reply && (
                    <div className="bg-landes-forest/5 border border-landes-forest/20 rounded-xl p-3">
                      <p className="text-xs font-semibold text-landes-forest mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/>Réponse du professionnel</p>
                      <p className="text-sm text-gray-700">{review.reply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {review.status !== "approved" && (
                      <button onClick={() => { saveReview({ ...review, status: "approved" }); setReviews(getReviews()); }}
                        className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium transition-colors">
                        <CheckCircle className="w-3.5 h-3.5"/> Approuver
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button onClick={() => { saveReview({ ...review, status: "rejected" }); setReviews(getReviews()); }}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                        <XCircle className="w-3.5 h-3.5"/> Rejeter
                      </button>
                    )}
                    <button onClick={() => setEditReview(review)}
                      className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                      <Edit3 className="w-3.5 h-3.5"/> Modifier
                    </button>
                    <button onClick={() => { if (confirm("Supprimer cet avis ?")) { deleteReview(review.id); setReviews(getReviews()); } }}
                      className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/> Supprimer
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Section Professionnels ── */}
      {adminSection === "pros" && (<>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-gray-700" },
          { label: "Actifs", value: stats.active, icon: CheckCircle, color: "text-green-600" },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-orange-500" },
          { label: "Suspendus", value: stats.suspended, icon: XCircle, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List */}
        <div className="flex-1">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-10" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusType | "")} className="input-field sm:w-40">
              <option value="">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
              <option value="rejected">Refusés</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">Aucun professionnel trouvé</div>
            ) : filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedPro(p); setEditMode(false); setEditForm(p); }}
                className={`card p-4 cursor-pointer hover:shadow-md transition-all ${selectedPro?.id === p.id ? "ring-2 ring-landes-forest" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 bg-landes-forest/10 rounded-lg flex items-center justify-center text-landes-forest font-bold text-sm flex-shrink-0">
                      {p.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.companyName}</p>
                      <p className="text-xs text-gray-500 truncate">{p.email}</p>
                      <p className="text-xs text-gray-400">{p.city} — {p.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={p.status} />
                    <PlanBadge plan={p.plan} />
                  </div>
                </div>

                {p.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => updateStatus(p.id, "active")} className="flex-1 text-xs bg-green-600 text-white py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      ✓ Valider
                    </button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="flex-1 text-xs bg-red-100 text-red-700 py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors">
                      ✗ Refuser
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedPro && (
          <div className="lg:w-96 card p-6 h-fit sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-landes-pine">Détail de la fiche</h2>
              <div className="flex gap-2">
                <button onClick={() => setEditMode(!editMode)} className={`p-1.5 rounded-lg text-sm ${editMode ? "bg-gray-200 text-gray-600" : "bg-landes-forest/10 text-landes-forest"}`}>
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedPro(null)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {editMode ? (
                <>
                  {[
                    { label: "Nom entreprise", field: "companyName" },
                    { label: "Téléphone", field: "phone" },
                    { label: "Adresse", field: "address" },
                    { label: "Ville", field: "city" },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input value={(editForm as any)[field] || ""} onChange={(e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))} className="input-field" />
                    </div>
                  ))}
                  <div>
                    <label className="label">Catégorie</label>
                    <select value={editForm.category || ""} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} className="input-field">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Formule</label>
                    <select value={editForm.plan || ""} onChange={(e) => setEditForm((prev) => ({ ...prev, plan: e.target.value as any }))} className="input-field">
                      {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price}€</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea value={editForm.description || ""} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} className="input-field h-20 resize-none" />
                  </div>
                  <button onClick={handleSaveEdit} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2 text-sm">
                    {[
                      ["SIREN", selectedPro.siren],
                      ["Forme juridique", selectedPro.legalForm],
                      ["Catégorie", selectedPro.category],
                      ["Email", selectedPro.email],
                      ["Téléphone", selectedPro.phone],
                      ["Adresse", `${selectedPro.address}, ${selectedPro.city} ${selectedPro.postalCode}`],
                      ["Inscrit le", new Date(selectedPro.createdAt).toLocaleDateString("fr-FR")],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 py-2 border-b border-gray-50">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-800 text-right">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status actions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPro.status !== "active" && (
                        <button onClick={() => updateStatus(selectedPro.id, "active")} className="text-xs bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">✓ Activer</button>
                      )}
                      {selectedPro.status !== "suspended" && (
                        <button onClick={() => updateStatus(selectedPro.id, "suspended")} className="text-xs bg-orange-100 text-orange-700 py-2 rounded-lg font-medium hover:bg-orange-200">⏸ Suspendre</button>
                      )}
                      {selectedPro.status !== "rejected" && (
                        <button onClick={() => updateStatus(selectedPro.id, "rejected")} className="text-xs bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200">✗ Refuser</button>
                      )}
                      <button onClick={() => handleDelete(selectedPro.id)} className="text-xs bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>)}
    </div>
  );
}
