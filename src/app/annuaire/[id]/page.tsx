"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin, Phone, Globe, Mail, ArrowLeft, Clock,
  Building2, Shield, ExternalLink, Share2, CheckCircle,
  X, Images, ChevronLeft, ChevronRight, MessageCircle, Send, Loader2,
} from "lucide-react";
import { getProfessionalById, recordVisit } from "@/lib/storage";
import { Professional, formatDayHours } from "@/types";
import { getBanner } from "@/lib/defaultBanners";

const SingleMap     = dynamic(() => import("@/components/map/SingleMap"), { ssr: false });
const ReviewSection = dynamic(() => import("@/components/professional/ReviewSection"), { ssr: false });
import StarDisplay from "@/components/ui/StarDisplay";
import { getApprovedReviewsByPro } from "@/lib/storage";

const DAY_LABELS: Record<string, string> = {
  monday:"Lundi", tuesday:"Mardi", wednesday:"Mercredi",
  thursday:"Jeudi", friday:"Vendredi", saturday:"Samedi", sunday:"Dimanche",
};
const DAYS_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function getTodayKey() {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
}

function isOpenNow(pro: Professional): { open: boolean; label: string } {
  if (!pro.openingHours) return { open: false, label: "Horaires non renseignés" };
  if (pro.openingHours.alwaysOpen) return { open: true, label: "Toujours ouvert" };
  const key   = getTodayKey();
  const hours = (pro.openingHours as any)[key];
  if (!hours || hours.closed) return { open: false, label: "Fermé aujourd'hui" };

  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const inRange = (o?: string, c?: string) => {
    if (!o || !c) return false;
    const [oh,om] = o.split(":").map(Number);
    const [ch,cm] = c.split(":").map(Number);
    return now >= oh*60+om && now < ch*60+cm;
  };

  if (inRange(hours.morningOpen, hours.morningClose))
    return { open: true, label: `Ouvert · Ferme à ${hours.morningClose}` };
  if (inRange(hours.afternoonOpen, hours.afternoonClose))
    return { open: true, label: `Ouvert · Ferme à ${hours.afternoonClose}` };
  // legacy
  if (inRange(hours.open, hours.close))
    return { open: true, label: `Ouvert · Ferme à ${hours.close}` };

  return { open: false, label: "Fermé pour le moment" };
}

// ── Galerie photos interactive avec lightbox ───────────────────
function PhotoGallery({ photos, companyName }: { photos: string[]; companyName: string }) {
  const [active, setActive]     = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const prev = () => setActive(i => (i - 1 + photos.length) % photos.length);
  const next = () => setActive(i => (i + 1) % photos.length);

  // Focus overlay when lightbox opens for keyboard nav
  useEffect(() => {
    if (lightbox) overlayRef.current?.focus();
  }, [lightbox]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
    if (e.key === "Escape")     { e.preventDefault(); setLightbox(false); }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Images className="w-4 h-4 text-landes-sage" />
        <p className="font-bold text-landes-pine text-base">
          Photos
          <span className="text-xs font-normal text-gray-400 ml-1">({photos.length})</span>
        </p>
      </div>

      {/* Miniatures côte à côte */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-5 gap-2">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setActive(i); setLightbox(true); }}
              className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity border-2 border-transparent hover:border-landes-sage"
            >
              <img
                src={src}
                alt={`${companyName} — photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          tabIndex={-1}
          style={{ outline: "none" }}
          onClick={e => { if (e.target === e.currentTarget) setLightbox(false); }}
          onKeyDown={handleKey}
        >
          {/* Bouton fermer — sous la navbar */}
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-5 z-[10000] flex items-center justify-center text-white transition-colors"
            style={{
              top: 80,
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.25)",
              border: "2px solid rgba(255,255,255,0.7)",
              borderRadius: "50%",
              boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
            aria-label="Fermer"
          >
            <X className="w-6 h-6" style={{ strokeWidth: 2.5 }} />
          </button>

          {/* Compteur */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none" style={{ top: 90 }}>
            {active + 1} / {photos.length}
          </div>

          {/* Flèche gauche */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image principale */}
          <div
            className="flex items-center justify-center w-full h-full px-20 py-20"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[active]}
              alt={`${companyName} — photo ${active + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Flèche droite */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Miniatures en bas */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-xs sm:max-w-lg px-2"
            onClick={e => e.stopPropagation()}
          >
            {photos.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === active ? "border-white opacity-100" : "border-white/30 opacity-50 hover:opacity-80"
                }`}
              >
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfessionalProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const [pro, setPro]       = useState<Professional | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [questionSent, setQuestionSent] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  useEffect(() => {
    const d = getProfessionalById(id);
    if (!d) { setNotFound(true); return; }
    // Ne pas afficher les fiches non validées
    if (d.status === "pending" || d.status === "rejected") { setNotFound(true); return; }
    setPro(d);

    // Enregistrer la visite pour les pros Gold
    if (d.plan === "gold" && d.status === "active") {
      const params = new URLSearchParams(window.location.search);
      const ref = document.referrer;
      let source: "direct" | "search" | "category" | "map" = "direct";
      if (params.get("from") === "map")      source = "map";
      else if (params.get("from") === "cat") source = "category";
      else if (ref.includes("/annuaire"))    source = "search";
      recordVisit(d.id, source);
    }

    // Si le pro n'a pas de coordonnées, tenter de les obtenir et sauvegarder
    if (!d.lat || !d.lng) {
      import("@/lib/geocode").then(({ geocodeAddress }) =>
        geocodeAddress(d.address, d.city, d.postalCode)
      ).then(coords => {
        if (!coords) return;
        const updated = { ...d, lat: coords.lat, lng: coords.lng, updatedAt: new Date().toISOString() };
        import("@/lib/storage").then(({ saveProfessional }) => saveProfessional(updated));
        setPro(updated);
      }).catch(() => {});
    }
  }, [id]);

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🌲</p>
      <p className="text-2xl font-bold text-landes-pine mb-2">Professionnel introuvable</p>
      <p className="text-gray-500 mb-6">Cette fiche n&apos;existe pas ou a été supprimée.</p>
      <Link href="/categories" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour aux catégories
      </Link>
    </div>
  );

  if (!pro) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-landes-forest border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials    = pro.companyName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const todayKey    = getTodayKey();
  const openStatus  = isOpenNow(pro);
  const hasHours    = pro.openingHours && Object.keys(pro.openingHours).length > 0;
  const approvedReviews = getApprovedReviewsByPro(pro.id);
  const proRating = approvedReviews.length
    ? { avg: Math.round(approvedReviews.reduce((s,r) => s + r.rating, 0) / approvedReviews.length * 10) / 10, count: approvedReviews.length }
    : null;

  // Map category name → slug
  const CATEGORY_SLUGS: Record<string, string> = {
    "Alimentation & Épicerie":    "alimentation",
    "Artisanat & Métiers d'art":  "artisanat",
    "Bâtiment & Travaux":         "batiment",
    "Beauté & Bien-être":         "beaute",
    "Commerce & Vente":           "commerce",
    "Culture & Loisirs":          "culture",
    "Éducation & Formation":      "education",
    "Hébergement & Tourisme":     "hebergement",
    "Hôtellerie & Restauration":  "restauration",
    "Immobilier":                 "immobilier",
    "Informatique & Numérique":   "informatique",
    "Médical & Paramédical":      "medical",
    "Nature & Agriculture":       "agriculture",
    "Services à la personne":     "services",
    "Sport & Fitness":            "sport",
    "Transport & Logistique":     "transport",
  };
  const categorySlug = CATEGORY_SLUGS[pro.category] || null;

  return (
    <div className="bg-landes-cream min-h-screen">

      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href={categorySlug ? `/categories/${categorySlug}` : "/categories"}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-landes-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la catégorie {pro.category}
        </Link>
      </div>

      {/* BANNER */}
      <div className="relative mt-4 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full rounded-2xl overflow-hidden h-44 sm:h-56 relative">
          {(() => {
            const src = getBanner(pro.banner, pro.category);
            return src
              ? <img src={src} alt="Bannière" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-landes-pine via-landes-forest to-landes-ocean" />;
          })()}
          {/* Overlay gradient bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Logo + name overlaid on banner */}
        <div className="absolute bottom-0 left-8 sm:left-10 translate-y-1/2 flex items-end gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
            {pro.logo
              ? <img src={pro.logo} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-landes-forest to-landes-sage flex items-center justify-center text-white font-bold text-2xl">
                  {initials}
                </div>
            }
          </div>
        </div>

        {/* Share button top-right */}
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2500); }}
          className="absolute top-3 right-3 flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Copié !" : "Partager"}
        </button>
      </div>

      {/* Name + badges / infos légales — 2 colonnes */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauche — nom, badges, catégorie, statut */}
          <div className="lg:col-span-2">
            {/* Ligne 1 : nom + badge vérifié */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl sm:text-3xl font-bold text-landes-pine">{pro.companyName}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Vérifié Prolocal-Landes
              </span>
            </div>
            {/* Ligne 2 : badges services (Premium et Gold uniquement) */}
            {pro.plan !== "standard" && pro.services && pro.services.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {pro.services.map((svc, i) => {
                  const styles = ["bg-landes-forest text-white","bg-landes-sage text-white","bg-amber-500 text-white"];
                  return <span key={i} className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[i % styles.length]}`}>{svc}</span>;
                })}
              </div>
            )}
            {/* Ligne 3 : titre d'activité */}
            {pro.activityTitle && (
              <h1 className="text-base font-semibold text-landes-pine mt-2">{pro.activityTitle}</h1>
            )}
            <p className="text-landes-sage font-medium mt-0.5 flex items-center gap-3">
              {pro.category}
              {proRating && <StarDisplay rating={proRating.avg} count={proRating.count} size="sm" />}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" /> {pro.city} ({pro.postalCode})
              </span>
              {hasHours && (
                <span className={`flex items-center gap-1.5 text-sm font-medium ${openStatus.open ? "text-green-600" : "text-red-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${openStatus.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                  {openStatus.label}
                </span>
              )}
            </div>
          </div>

          {/* Droite — informations légales */}
          <div className="card p-5">
            <p className="font-bold text-landes-pine text-base mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-landes-sage" /> Informations légales
            </p>
            <div className="flex items-start justify-between gap-4 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Forme juridique</p>
                <p className="font-medium text-gray-700">{pro.legalForm}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-0.5">Numéro SIREN</p>
                <p className="font-medium text-gray-700 font-mono">{pro.siren.replace(/(\d{3})(\d{3})(\d{3})/,"$1 $2 $3")}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Membre depuis {new Date(pro.createdAt).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}
            </p>
          </div>
        </div>
      </div>
      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 lg:self-start">

            {/* About */}
            <div className="card p-6">
              <p className="font-bold text-landes-pine text-lg mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-landes-sage" /> À propos
              </p>
              <div
                className="pro-description leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pro.description }}
              />
            </div>

            {/* ── Galerie photos ── */}
            {pro.photos && pro.photos.length > 0 && (
              <PhotoGallery photos={pro.photos} companyName={pro.companyName} />
            )}

            {/* ── Laisser un avis (colonne gauche, même largeur) ── */}
            <ReviewSection proId={pro.id} companyName={pro.companyName} formOnly />

          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="card p-6 space-y-4">
              <p className="font-bold text-landes-pine text-lg">Contacter</p>

              {/* Bouton Poser une question */}
              <button
                onClick={() => { setShowQuestion(true); setQuestionSent(false); }}
                className="w-full flex items-center justify-center gap-2 bg-landes-forest text-white font-semibold py-3 px-4 rounded-xl hover:bg-landes-pine transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Poser une question
              </button>


              {pro.phone && (
                <a href={`tel:${pro.phone}`} className="flex items-center gap-3 p-3 bg-landes-forest/5 hover:bg-landes-forest/10 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-landes-forest text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Téléphone</p>
                    <p className="font-semibold text-landes-pine group-hover:text-landes-forest">{pro.phone}</p>
                  </div>
                </a>
              )}

              <a href={`mailto:${pro.email}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium text-gray-700 truncate text-sm">{pro.email}</p>
                </div>
              </a>

              {pro.website && (
                <a href={pro.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Site internet</p>
                    <p className="font-medium text-blue-700 truncate text-sm flex items-center gap-1">
                      {pro.website.replace(/https?:\/\//,"")} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              )}
              {pro.socialLink && (
                <a href={pro.socialLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-base">
                    📷
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Instagram</p>
                    <p className="font-medium text-pink-700 truncate text-sm flex items-center gap-1">
                      {pro.socialLink.replace(/^https?:\/\/(www\.)?instagram\.com\/?/,"@").replace(/\/$/,"")} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              )}
              {pro.facebookLink && (
                <a href={pro.facebookLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-base">
                    📘
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Facebook</p>
                    <p className="font-medium text-blue-700 truncate text-sm flex items-center gap-1">
                      {pro.facebookLink.replace(/^https?:\/\/(www\.)?facebook\.com\/?/,"").replace(/\/$/,"")} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              )}
              {pro.tiktokLink && (
                <a href={pro.tiktokLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-base">
                    🎵
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">TikTok</p>
                    <p className="font-medium text-gray-800 truncate text-sm flex items-center gap-1">
                      {pro.tiktokLink.replace(/^https?:\/\/(www\.)?tiktok\.com\/?/,"").replace(/\/$/,"")} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              )}

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 bg-landes-sand/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-landes-dune" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                  <p className="text-sm font-medium text-gray-700 leading-snug">{pro.address}<br />{pro.postalCode} {pro.city}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pro.address} ${pro.city}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-landes-forest hover:underline mt-1 inline-flex items-center gap-1">
                    Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {!pro.lat && !pro.lng && (
                <p className="text-xs text-gray-400 text-center py-2">
                  📍 {pro.address}, {pro.city}
                </p>
              )}
            </div>

            {/* Opening hours */}
            {hasHours && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-landes-pine text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-landes-sage" /> Horaires
                  </p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${openStatus.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${openStatus.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                    {openStatus.label}
                  </span>
                </div>
                {pro.openingHours?.alwaysOpen ? (
                  <div className="flex items-center gap-2 px-2 py-3 bg-green-50 rounded-xl">
                    <span className="text-lg">🕐</span>
                    <p className="text-sm font-semibold text-green-700">Ouvert 24h/24 — 7j/7</p>
                  </div>
                ) : (
                <div className="space-y-0.5">
                  {DAYS_ORDER.map(day => {
                    const h = (pro.openingHours as any)?.[day];
                    if (!h) return null;
                    const isToday = day === todayKey;
                    return (
                      <div key={day} className={`flex justify-between items-center py-1.5 px-2 rounded-lg text-xs ${isToday ? "bg-landes-forest/10 font-semibold" : "hover:bg-gray-50"}`}>
                        <span className={`w-20 flex-shrink-0 ${isToday ? "text-landes-forest" : "text-gray-600"}`}>
                          {isToday && "→ "}{DAY_LABELS[day]}
                        </span>
                        <span className={`text-right ${isToday ? "text-landes-forest" : "text-gray-700"}`}>
                          {formatDayHours(h)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {/* Map — sous les horaires */}
            {pro.lat && pro.lng && (
              <div className="card-map" style={{ height: 260 }}>
                <SingleMap lat={pro.lat} lng={pro.lng} name={pro.companyName} address={`${pro.address}, ${pro.city}`} />
              </div>
            )}

            {/* Avis clients */}
            <ReviewSection proId={pro.id} companyName={pro.companyName} carouselOnly />

          </div>
        </div>
      </div>

      {/* ── Modale "Poser une question" ── */}
      {showQuestion && pro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowQuestion(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-landes-forest/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-landes-forest" />
                </div>
                <div>
                  <h3 className="font-bold text-landes-pine">Poser une question</h3>
                  <p className="text-xs text-gray-400">{pro.companyName}</p>
                </div>
              </div>
              <button onClick={() => setShowQuestion(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {questionSent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-landes-pine mb-1">Message envoyé !</p>
                  <p className="text-sm text-gray-500">
                    {pro.companyName} a bien reçu votre question et vous répondra dans les plus brefs délais.
                  </p>
                </div>
                <button onClick={() => setShowQuestion(false)} className="btn-secondary py-2 px-5 text-sm">Fermer</button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={async e => {
                  e.preventDefault();
                  const errs: Record<string, string> = {};
                  if (!questionForm.firstName.trim()) errs.firstName = "Requis";
                  if (!questionForm.lastName.trim())  errs.lastName  = "Requis";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(questionForm.email)) errs.email = "Email invalide";
                  if (questionForm.message.trim().length < 10) errs.message = "10 caractères minimum";
                  if (Object.keys(errs).length) { setQuestionErrors(errs); return; }
                  setQuestionLoading(true);
                  await new Promise(r => setTimeout(r, 800));
                  setQuestionLoading(false);
                  setQuestionSent(true);
                  setQuestionForm({ firstName: "", lastName: "", email: "", message: "" });
                  setQuestionErrors({});
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prénom *</label>
                    <input
                      value={questionForm.firstName}
                      onChange={e => { setQuestionForm(p => ({ ...p, firstName: e.target.value })); setQuestionErrors(p => ({ ...p, firstName: "" })); }}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage ${questionErrors.firstName ? "border-red-400" : "border-gray-200"}`}
                      placeholder="Jean"
                    />
                    {questionErrors.firstName && <p className="text-red-500 text-xs mt-1">{questionErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
                    <input
                      value={questionForm.lastName}
                      onChange={e => { setQuestionForm(p => ({ ...p, lastName: e.target.value })); setQuestionErrors(p => ({ ...p, lastName: "" })); }}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage ${questionErrors.lastName ? "border-red-400" : "border-gray-200"}`}
                      placeholder="Dupont"
                    />
                    {questionErrors.lastName && <p className="text-red-500 text-xs mt-1">{questionErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    value={questionForm.email}
                    onChange={e => { setQuestionForm(p => ({ ...p, email: e.target.value })); setQuestionErrors(p => ({ ...p, email: "" })); }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage ${questionErrors.email ? "border-red-400" : "border-gray-200"}`}
                    placeholder="jean@example.fr"
                  />
                  {questionErrors.email && <p className="text-red-500 text-xs mt-1">{questionErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Votre question *</label>
                  <textarea
                    value={questionForm.message}
                    onChange={e => { setQuestionForm(p => ({ ...p, message: e.target.value })); setQuestionErrors(p => ({ ...p, message: "" })); }}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage resize-none ${questionErrors.message ? "border-red-400" : "border-gray-200"}`}
                    placeholder="Bonjour, j'aimerais savoir…"
                  />
                  {questionErrors.message && <p className="text-red-500 text-xs mt-1">{questionErrors.message}</p>}
                </div>

                <p className="text-xs text-gray-400">Votre question sera transmise directement à {pro.companyName}.</p>

                <button type="submit" disabled={questionLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                  {questionLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                    : <><Send className="w-4 h-4" /> Envoyer ma question</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
