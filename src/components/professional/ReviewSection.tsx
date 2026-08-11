"use client";
import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle, User, Flag, MessageSquare } from "lucide-react";
import { getApprovedReviewsByPro, saveReview, generateId, reviewExists, flagReview } from "@/lib/storage";
import type { Review } from "@/types";

interface Props {
  proId: string;
  companyName: string;
  formOnly?: boolean;
  carouselOnly?: boolean;
}

function StarRating({ value, onChange, readonly = false, size = "md" }: {
  value: number; onChange?: (v: number) => void;
  readonly?: boolean; size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const cls = { sm: "w-4 h-4", md: "w-7 h-7", lg: "w-8 h-8" }[size];
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}>
          <Star className={`${cls} transition-colors ${
            s <= (hovered || value) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          }`} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onFlag }: { review: Review; onFlag: () => void }) {
  const [flagged, setFlagged] = useState(review.flagged ?? false);
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const date = new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const initials = `${review.firstName[0]}${review.lastName[0]}`.toUpperCase();

  const handleFlag = () => {
    flagReview(review.id);
    setFlagged(true);
    setShowFlagConfirm(false);
    onFlag();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-landes-forest text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-landes-pine text-sm">{review.firstName} {review.lastName}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">"{review.text}"</p>

      {review.reply && (
        <div className="bg-landes-forest/5 border border-landes-forest/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-landes-forest mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Réponse du professionnel
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{review.reply}</p>
        </div>
      )}

      <div className="flex justify-end pt-1 border-t border-gray-50">
        {flagged ? (
          <span className="text-xs text-orange-500 flex items-center gap-1"><Flag className="w-3 h-3" /> Signalé</span>
        ) : showFlagConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Confirmer ?</span>
            <button onClick={handleFlag} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200 font-medium">Oui</button>
            <button onClick={() => setShowFlagConfirm(false)} className="text-xs text-gray-400 hover:text-gray-600">Non</button>
          </div>
        ) : (
          <button onClick={() => setShowFlagConfirm(true)}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <Flag className="w-3 h-3" /> Dénoncer cet avis comme abusif
          </button>
        )}
      </div>
    </div>
  );
}

// ── Formulaire seul ──────────────────────────────────────────────
function ReviewForm({ proId, companyName }: { proId: string; companyName: string }) {
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", rating: 0, text: "" });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k: string, v: string | number) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Requis";
    if (!form.lastName.trim())  e.lastName  = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (form.rating === 0)      e.rating = "Veuillez choisir une note";
    if (form.text.trim().length < 30)  e.text = "30 caractères minimum";
    if (form.text.trim().length > 300) e.text = "300 caractères maximum";
    if (!e.firstName && !e.lastName && !e.email) {
      if (reviewExists(proId, form.email, form.firstName, form.lastName))
        e.email = "Un avis a déjà été déposé avec ces informations.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    saveReview({
      id: generateId(), proId,
      firstName: form.firstName.trim(),
      lastName:  form.lastName.trim(),
      email:     form.email.trim(),
      rating:    form.rating,
      text:      form.text.trim(),
      createdAt: new Date().toISOString(),
      status:    "pending",
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-landes-pine mb-1">Merci pour votre avis !</p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Votre avis sera publié dans les 24h à 48h après validation par notre équipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="font-bold text-landes-pine text-lg mb-1">Laisser un avis</p>
      <p className="text-gray-500 text-sm mb-4">Partagez votre expérience avec {companyName}</p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prénom *</label>
            <input value={form.firstName} onChange={e => upd("firstName", e.target.value)}
              className={`input-field ${errors.firstName ? "border-red-400" : ""}`} placeholder="Jean" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="label">Nom *</label>
            <input value={form.lastName} onChange={e => upd("lastName", e.target.value)}
              className={`input-field ${errors.lastName ? "border-red-400" : ""}`} placeholder="Dupont" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" value={form.email} onChange={e => upd("email", e.target.value)}
            className={`input-field ${errors.email ? "border-red-400" : ""}`} placeholder="jean@example.fr" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          <p className="text-xs text-gray-400 mt-1">Votre email ne sera pas affiché publiquement.</p>
        </div>
        <div>
          <label className="label">Note *</label>
          <div className="mt-1"><StarRating value={form.rating} onChange={v => upd("rating", v)} size="lg" /></div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>
        <div>
          <label className="label">Votre avis * <span className="text-gray-400 font-normal">(30–300 caractères)</span></label>
          <textarea value={form.text} onChange={e => upd("text", e.target.value)}
            rows={4} maxLength={300}
            className={`input-field resize-none ${errors.text ? "border-red-400" : ""}`}
            placeholder="Décrivez votre expérience avec ce professionnel…" />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${form.text.length > 280 ? "text-orange-500" : "text-gray-400"}`}>
              {form.text.length}/300
            </span>
          </div>
          {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi…</>
            : "Publier mon avis"
          }
        </button>
      </form>
    </div>
  );
}

// ── Carrousel seul ───────────────────────────────────────────────
function ReviewCarousel({ proId }: { proId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [idx, setIdx]         = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = () => setReviews(getApprovedReviewsByPro(proId));
  useEffect(() => { load(); }, [proId]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % reviews.length), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reviews.length]);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reviews.length > 1)
      intervalRef.current = setInterval(() => setIdx(i => (i + 1) % reviews.length), 5000);
  };

  const avg = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-landes-pine text-base">
            Avis clients
            <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length})</span>
          </p>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
              <span className="text-xs font-semibold text-gray-700 ml-0.5">{avg.toFixed(1)}</span>
              <span className="text-xs text-gray-400">/ 5</span>
            </div>
          )}
        </div>
        {reviews.length > 1 && (
          <div className="flex gap-1.5">
            <button onClick={() => { setIdx(i => Math.max(0, i-1)); resetInterval(); }}
              disabled={idx === 0}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setIdx(i => Math.min(reviews.length-1, i+1)); resetInterval(); }}
              disabled={idx >= reviews.length-1}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-4">
          <User className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-400">Aucun avis validé</p>
        </div>
      ) : (
        <div>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${idx * 100}%)` }}>
              {reviews.map(r => (
                <div key={r.id} className="flex-shrink-0 w-full">
                  <ReviewCard review={r} onFlag={load} />
                </div>
              ))}
            </div>
          </div>
          {reviews.length > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => { setIdx(i); resetInterval(); }}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-landes-forest" : "w-1.5 bg-gray-300"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────────
export default function ReviewSection({ proId, companyName, formOnly, carouselOnly }: Props) {
  if (formOnly)    return <ReviewForm proId={proId} companyName={companyName} />;
  if (carouselOnly) return <ReviewCarousel proId={proId} />;

  // Mode complet (ancien, conservé pour compatibilité)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ReviewForm proId={proId} companyName={companyName} />
      <ReviewCarousel proId={proId} />
    </div>
  );
}
