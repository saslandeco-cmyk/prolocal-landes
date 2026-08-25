"use client";
import {
  CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  ImagePlus, X, CreditCard, Mail,
} from "lucide-react";
import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PLANS, CATEGORIES, SUBCATEGORIES, type Professional } from "@/types";
import { saveProfessional, setSession, generateId, getProfessionals } from "@/lib/storage";
import { REQUIRE_VALIDATION } from "@/lib/config";
import { lookupSiren } from "@/lib/siren";
import RichTextEditor from "@/components/ui/RichTextEditor";
import OpeningHoursEditor from "@/components/ui/OpeningHoursEditor";
import type { OpeningHours } from "@/types";
import { saveWizardState, loadWizardState, clearWizardState } from "@/lib/wizardPersistence";

type PlanType = "standard" | "premium" | "gold";
type Step = 1 | 2 | "pub" | "seo" | 3 | 4;

const MAX_PHOTOS = 5;

const COMPLEMENTARY_OPTIONS = [
  { id: "pub",   label: "Encart publicitaire ciblé",      price: "50€", unit: "/mois" },
  { id: "seo",   label: "Service de rédaction SEO",       price: "50€", unit: "(frais uniques)" },
  { id: "crm",   label: "Gestion prospects/clients",      price: "30€", unit: "/mois" },
] as const;

async function readFileAsBase64(file: File, type: "logo" | "banner" | "photo" = "photo"): Promise<string> {
  const { compressLogo, compressBanner, compressPhoto } = await import("@/lib/imageUtils");
  if (type === "logo")   return compressLogo(file);
  if (type === "banner") return compressBanner(file);
  return compressPhoto(file);
}

// ── Single image uploader ──────────────────────────────────────
function ImageUploader({
  label, hint, value, onChange, aspect,
}: {
  label: string; hint: string;
  value: string; onChange: (b64: string) => void;
  aspect?: "square" | "banner";
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange(await readFileAsBase64(f, aspect === "banner" ? "banner" : "logo"));
    e.target.value = "";
  };

  const h = aspect === "banner" ? "h-28" : "h-28 w-28";
  const r = aspect === "banner" ? "rounded-xl w-full" : "rounded-2xl";

  return (
    <div>
      <label className="label">{label}</label>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <div
        className={`${h} ${r} border-2 border-dashed border-gray-200 hover:border-landes-sage flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative bg-gray-50`}
        onClick={() => ref.current?.click()}
      >
        {value
          ? <img src={value} alt="preview" className="w-full h-full object-cover" />
          : <div className="flex flex-col items-center gap-1 text-gray-400">
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Cliquer pour ajouter</span>
            </div>
        }
        {value && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(""); }}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
}

// ── Multi-photo uploader (max 5) ───────────────────────────────
function PhotosUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleFileAt = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await readFileAsBase64(file, "photo");
    const next = [...photos];
    next[idx] = result;
    onChange(next.filter(Boolean));
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    onChange(next);
  };

  const moveLeft = (idx: number) => {
    if (idx === 0) return;
    const arr = [...photos];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  const moveRight = (idx: number) => {
    if (idx === photos.length - 1) return;
    const arr = [...photos];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onChange(arr);
  };

  return (
    <div>
      <label className="label">Photos de l&apos;entreprise (max {MAX_PHOTOS})</label>
      <p className="text-xs text-gray-400 mb-3">
        Ces photos apparaîtront sur votre fiche publique. La première photo sera mise en avant.
        JPG, PNG recommandés.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, idx) => {
          const src = photos[idx];
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {src ? (
                  <>
                    <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button type="button" onClick={() => moveLeft(idx)}
                            className="w-6 h-6 bg-white/80 rounded text-gray-700 text-xs flex items-center justify-center hover:bg-white font-bold">←</button>
                        )}
                        {idx < photos.length - 1 && photos[idx + 1] && (
                          <button type="button" onClick={() => moveRight(idx)}
                            className="w-6 h-6 bg-white/80 rounded text-gray-700 text-xs flex items-center justify-center hover:bg-white font-bold">→</button>
                        )}
                      </div>
                      <button type="button" onClick={() => removeAt(idx)}
                        className="w-6 h-6 bg-red-500 rounded text-white flex items-center justify-center hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-landes-forest text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                        1ère
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => refs.current[idx]?.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 hover:border-landes-sage text-gray-400 hover:text-landes-forest transition-colors rounded-xl"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Photo {idx + 1}</span>
                  </button>
                )}
              </div>
              <input
                ref={el => { refs.current[idx] = el; }}
                type="file"
                accept="image/*"
                onChange={e => handleFileAt(idx, e)}
                className="hidden"
              />
            </div>
          );
        })}
      </div>

      {photos.length === MAX_PHOTOS && (
        <p className="text-xs text-landes-sage font-medium mt-2">
          Limite de {MAX_PHOTOS} photos atteinte.
        </p>
      )}
    </div>
  );
}

const DEFAULT_HOURS: OpeningHours = {
  monday:    { open: "09:00", close: "18:00", closed: false },
  tuesday:   { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday:  { open: "09:00", close: "18:00", closed: false },
  friday:    { open: "09:00", close: "17:00", closed: false },
  saturday:  { open: "09:00", close: "12:00", closed: false },
  sunday:    { open: "", close: "", closed: true },
};

const LANDES_CITIES = [
  "Aire-sur-l'Adour","Biscarrosse","Capbreton","Castets","Dax","Hagetmau",
  "Hossegor","Labouheyre","Labrit","Lit-et-Mixe","Mimizan","Mont-de-Marsan",
  "Morcenx","Parentis-en-Born","Pissos","Peyrehorade","Sabres","Saint-Paul-lès-Dax",
  "Saint-Sever","Saint-Vincent-de-Tyrosse","Soustons","Tarnos","Tartas",
  "Villeneuve-de-Marsan",
];

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step,         setStep]         = useState<Step>(1);
  const [loading,      setLoading]      = useState(false);
  const [sirenStatus,  setSirenStatus]  = useState<"idle"|"loading"|"valid"|"invalid">("idle");
  const [showDuplicateSirenModal, setShowDuplicateSirenModal] = useState(false);
  const [seoOpen,      setSeoOpen]      = useState(false);
  const [sirenMsg,     setSirenMsg]     = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [pubImage, setPubImage] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(["", ""]);
  const [paymentChoice, setPaymentChoice] = useState<"card" | "cheque">("card");
  const [stripePaid, setStripePaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [hours,        setHours]        = useState<OpeningHours>(DEFAULT_HOURS);
  const [photos,       setPhotos]       = useState<string[]>([]);
  const [services,     setServices]     = useState<string[]>(["", "", ""]);

  const [form, setForm] = useState({
    companyName:"", siren:"", legalForm:"", category:"", subcategory:"",
    activityTitle:"", shortDescription:"", description:"",
    website:"", socialLink:"", facebookLink:"", tiktokLink:"", whatsapp:"",
    firstName:"", lastName:"", email:"", phone:"",
    password:"", loginEmail:"",
    address:"", city:"", postalCode:"",
    logo:"", banner:"",
  });


  const upd = (f: string, v: string) => {
    setForm(p => ({ ...p, [f]: v }));
    setErrors(p => ({ ...p, [f]: "" }));
  };

  const checkSiren = async () => {
    const clean = form.siren.replace(/\s/g, "");
    if (clean.length !== 9) { setSirenStatus("invalid"); setSirenMsg("9 chiffres requis."); return; }

    // Vérifie si ce SIREN est déjà inscrit sur le site
    const existing = getProfessionals().find(p => p.siren.replace(/\s/g, "") === clean);
    if (existing) {
      setShowDuplicateSirenModal(true);
      setSirenStatus("invalid");
      setSirenMsg("Ce SIREN est déjà inscrit sur Prolocal-Landes.");
      return;
    }

    setSirenStatus("loading");
    const r = await lookupSiren(clean);
    if (r?.valid) { setSirenStatus("valid"); setSirenMsg("SIREN valide — entreprise active."); }
    else          { setSirenStatus("invalid"); setSirenMsg("SIREN invalide ou entreprise non active."); }
  };

  const v1 = () => {
    const e: Record<string,string> = {};
    if (!form.companyName)                                                    e.companyName   = "Requis";
    if (form.siren.replace(/\s/g,"").length !== 9)                           e.siren         = "9 chiffres requis";
    if (sirenStatus !== "valid")                                              e.siren         = "Validez votre SIREN d'abord";
    if (!form.legalForm)                                                      e.legalForm     = "Requis";
    if (!form.category)                                                       e.category      = "Requis";
    if (!form.activityTitle.trim())                                           e.activityTitle = "Requis";
    if (form.activityTitle.trim().length > 60)                               e.activityTitle = "60 caractères maximum";
    if (form.shortDescription.trim().length > 150)                           e.shortDescription = "150 caractères maximum";
    if (form.description.replace(/<[^>]*>/g,"").trim().length < 500)        e.description   = "500 caractères minimum";
    if (form.description.replace(/<[^>]*>/g,"").trim().length > 2500)       e.description   = "2 500 caractères maximum";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const v2 = () => {
    const e: Record<string,string> = {};
    if (!form.firstName)                                                      e.firstName       = "Requis";
    if (!form.lastName)                                                       e.lastName        = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))                     e.email           = "Email invalide";
    if (!form.phone)                                                          e.phone           = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginEmail))                e.loginEmail      = "Email invalide";
    if (form.password.length < 8)                                             e.password        = "8 caractères minimum";
    if (!form.address)                                                        e.address         = "Requis";
    if (!form.city)                                                           e.city            = "Requis";
    if (!/^40\d{3}$/.test(form.postalCode))                                  e.postalCode      = "Code postal Landes (40xxx)";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  const needsPayment = selectedPlan !== null && (selectedPlan !== "standard" || selectedOptions.length > 0);

  // Démarre la session Stripe Checkout (redirection pleine page) pour la commande complète
  const startStripeCheckout = async () => {
    setLoading(true);
    try {
      saveWizardState({
        step, selectedPlan, selectedOptions, pubImage, seoKeywords,
        form, hours, photos, services, paymentChoice, stripePaid,
      });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          optionIds: selectedOptions,
          email: form.loginEmail || form.email,
          companyName: form.companyName,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirection pleine page vers Stripe Checkout
        return;
      }
      alert(data.error || "Erreur lors de la création du paiement.");
      setLoading(false);
    } catch {
      alert("Erreur réseau lors de la création du paiement.");
      setLoading(false);
    }
  };

  // Au retour de Stripe Checkout : vérifie le paiement auprès de Stripe et
  // restaure l'état du formulaire sauvegardé avant la redirection.
  useEffect(() => {
    const sessionId = searchParams.get("stripe_session_id");
    const cancelled = searchParams.get("stripe_cancelled");

    if (cancelled) {
      router.replace("/inscription");
      return;
    }
    if (!sessionId) return;

    setCheckingPayment(true);
    (async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        const saved = loadWizardState<any>();
        if (saved) {
          setStep(saved.step ?? 3);
          setSelectedPlan(saved.selectedPlan ?? null);
          setSelectedOptions(saved.selectedOptions ?? []);
          setPubImage(saved.pubImage ?? "");
          setSeoKeywords(saved.seoKeywords ?? ["", ""]);
          setForm((prev: any) => ({ ...prev, ...(saved.form ?? {}) }));
          setHours(saved.hours ?? DEFAULT_HOURS);
          setPhotos(saved.photos ?? []);
          setServices(saved.services ?? ["", "", ""]);
          setPaymentChoice(saved.paymentChoice ?? "card");

          if (data.paid) {
            setStripePaid(true);
          } else {
            alert("Le paiement n'a pas pu être confirmé auprès de Stripe. Merci de réessayer.");
          }
        }
      } finally {
        setCheckingPayment(false);
        clearWizardState();
        router.replace("/inscription");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Étapes dédiées aux options complémentaires sélectionnées (dans l'ordre pub → seo)
  const optionSteps = useMemo(
    () => (["pub", "seo"] as const).filter(id => selectedOptions.includes(id)),
    [selectedOptions]
  );

  // Séquence complète des étapes de la commande (hors étape 1, gérée séparément)
  // L'étape Paiement est désormais la dernière étape du parcours.
  // Pour la formule Standard (avec options), on ne passe pas par "Complétez votre fiche".
  const stepSequence = useMemo<Step[]>(() => {
    const seq: Step[] = [1, 2, ...optionSteps];
    if (selectedPlan !== "standard") seq.push(4);
    if (needsPayment) seq.push(3);
    return seq;
  }, [optionSteps, needsPayment, selectedPlan]);

  const goToStep = (target: Step) => setStep(target);

  const goNextFromSequence = (current: Step) => {
    const idx = stepSequence.indexOf(current);
    if (idx === -1) return;
    if (idx === stepSequence.length - 1) {
      // Dernière étape de la séquence : on finalise directement
      // (cas Standard + options, qui ne passe pas par "Complétez votre fiche")
      submit();
      return;
    }
    setStep(stepSequence[idx + 1]);
  };

  const goPrevFromSequence = (current: Step) => {
    const idx = stepSequence.indexOf(current);
    if (idx <= 0) return;
    setStep(stepSequence[idx - 1]);
  };

  const isLastStepInSequence = (current: Step) => stepSequence.indexOf(current) === stepSequence.length - 1;

  const submit = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const { geocodeAddress } = await import("@/lib/geocode");
      const coords = await geocodeAddress(form.address, form.city, form.postalCode);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    } catch { /* optionnel */ }

    const pro: Professional = {
      id: generateId(),
      companyName:   form.companyName,
      siren:         form.siren.replace(/\s/g,""),
      legalForm:     form.legalForm,
      category:      form.category,
      subcategory:   form.subcategory || undefined,
      activityTitle: form.activityTitle || undefined,
      shortDescription: form.shortDescription || undefined,
      description:   form.description,
      website:       form.website       || undefined,
      socialLink:    form.socialLink    || undefined,
      facebookLink:  form.facebookLink  || undefined,
      tiktokLink:    form.tiktokLink    || undefined,
      firstName:     form.firstName,
      lastName:      form.lastName,
      email:         form.loginEmail,   // email de connexion au tableau de bord
      professionalEmail: form.email,    // email professionnel affiché sur la fiche
      phone:         form.phone,
      whatsapp:      form.whatsapp || undefined,
      password:      form.password,
      address:       form.address,
      city:          form.city,
      postalCode:    form.postalCode,
      lat, lng,
      logo:    form.logo   || undefined,
      banner:  form.banner || undefined,
      photos:  photos.length > 0  ? photos  : undefined,
      services: services.filter(s => s.trim()).length > 0 ? services.filter(s => s.trim()) : undefined,
      plan: selectedPlan,
      complementaryOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
      paymentMethod: needsPayment ? paymentChoice : undefined,
      adBannerImage: selectedOptions.includes("pub") && pubImage ? pubImage : undefined,
      seoKeywords: selectedOptions.includes("seo") && seoKeywords.filter(k => k.trim()).length > 0
        ? seoKeywords.filter(k => k.trim())
        : undefined,
      status: REQUIRE_VALIDATION ? "pending" : "active",
      ...(REQUIRE_VALIDATION ? {} : { validatedAt: new Date().toISOString() }),
      openingHours: hours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfessional(pro);
    setSession("pro", pro.id);
    setLoading(false);
    router.push("/dashboard?welcome=1");
  };

  const STEP_LABELS = ["Entreprise & Coordonnées", "Votre formule", "Options & Finalisation"];

  return (
    <div className="w-[90%] mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-landes-pine mb-2">Inscrire mon entreprise</h1>
        <p className="text-gray-500">Référencez votre activité dans l&apos;annuaire Prolocal-Landes</p>
      </div>

      {/* ── STEP 1 : Entreprise & Coordonnées ── */}
      {step === 1 && (
        <>
          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold text-landes-pine bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Informations de l&apos;entreprise</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">
              {/* Ligne 1 (xl) : SIREN + bouton Vérifier / Nom entreprise / Forme juridique */}
              <div className="xl:col-span-4">
                <label className="label">Numéro SIREN *</label>
                <div className="flex gap-2">
                  <input value={form.siren} onChange={e => { upd("siren",e.target.value); setSirenStatus("idle"); }} className="input-field min-w-0 flex-1" placeholder="123 456 789" maxLength={11} />
                  <button onClick={checkSiren} disabled={sirenStatus==="loading"} type="button"
                    className="px-4 py-3 bg-landes-forest text-white rounded-lg text-sm font-medium hover:bg-landes-pine disabled:opacity-50 flex-shrink-0 whitespace-nowrap">
                    {sirenStatus==="loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier"}
                  </button>
                </div>
                {sirenStatus==="valid"   && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{sirenMsg}</p>}
                {sirenStatus==="invalid" && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{sirenMsg}</p>}
                {errors.siren && sirenStatus!=="invalid" && <p className="text-red-500 text-xs mt-1">{errors.siren}</p>}
              </div>

              <div className="xl:col-span-4">
                <label className="label">Nom de l&apos;entreprise *</label>
                <input value={form.companyName} onChange={e => upd("companyName",e.target.value)} className="input-field" placeholder="Ex: Boulangerie des Pins" />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
              </div>

              <div className="xl:col-span-4">
                <label className="label">Forme juridique *</label>
                <select value={form.legalForm} onChange={e => upd("legalForm",e.target.value)} className="input-field">
                  <option value="">Sélectionner…</option>
                  {["Auto-entrepreneur","EI","EURL","SARL","SAS","SASU","SA","SCP","Association","Autre"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.legalForm && <p className="text-red-500 text-xs mt-1">{errors.legalForm}</p>}
              </div>

              {/* Ligne 2 (xl) : Catégorie / Sous-catégorie (verrouillée tant que la catégorie n'est pas choisie) */}
              <div className="xl:col-span-6">
                <label className="label">Catégorie *</label>
                <select value={form.category} onChange={e => { upd("category",e.target.value); upd("subcategory",""); }} className="input-field">
                  <option value="">Sélectionner…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div className="xl:col-span-6">
                <label className="label">Sous-catégorie <span className="text-gray-400 font-normal text-xs">(facultatif)</span></label>
                <select
                  value={form.subcategory}
                  onChange={e => upd("subcategory",e.target.value)}
                  disabled={!form.category || !SUBCATEGORIES[form.category]}
                  className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!form.category
                      ? "Choisissez d'abord une catégorie"
                      : SUBCATEGORIES[form.category]
                        ? "Sélectionner…"
                        : "Aucune sous-catégorie disponible"}
                  </option>
                  {form.category && SUBCATEGORIES[form.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 xl:col-span-12">
                <label className="label">Titre de votre activité *</label>
                <input
                  value={form.activityTitle}
                  onChange={e => upd("activityTitle", e.target.value)}
                  className="input-field"
                  placeholder="Ex : Boulangerie artisanale bio, Dépannage informatique à domicile…"
                  maxLength={60}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.activityTitle
                    ? <p className="text-red-500 text-xs">{errors.activityTitle}</p>
                    : <p className="text-xs text-gray-400">Ce titre sera votre balise H1 — rédigez-le comme un titre optimisé pour le référencement.</p>
                  }
                  <span className={`text-xs ml-2 flex-shrink-0 ${form.activityTitle.length > 50 ? "text-orange-500" : "text-gray-400"}`}>
                    {form.activityTitle.length}/60
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 xl:col-span-12">
                <label className="label">Description courte <span className="text-gray-400 font-normal text-xs">(150 max.)</span></label>
                <textarea
                  value={form.shortDescription}
                  onChange={e => upd("shortDescription", e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Une phrase d'accroche affichée dans les résultats de recherche et les cartes professionnelles…"
                  maxLength={150}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.shortDescription
                    ? <p className="text-red-500 text-xs">{errors.shortDescription}</p>
                    : <p className="text-xs text-gray-400">Résumé court affiché sur les cartes et dans les résultats de recherche.</p>
                  }
                  <span className={`text-xs ml-2 flex-shrink-0 ${form.shortDescription.length > 130 ? "text-orange-500" : "text-gray-400"}`}>
                    {form.shortDescription.length}/150
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 xl:col-span-12">
                <label className="label">Description longue * <span className="text-gray-400 font-normal text-xs">(500 min. · 2 500 max.)</span></label>
                <div className="mb-2 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSeoOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      📋 Modèle de description optimisée SEO
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${seoOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {seoOpen && (
                    <div className="px-4 py-4 bg-white border-t border-gray-100 text-xs text-gray-500 space-y-3 leading-relaxed">
                      <div>
                        <p className="font-bold text-gray-700 mb-1">H2 — Titre principal optimisé pour le référencement naturel</p>
                        <p>Présentez ici votre activité principale avec vos mots-clés (ville, métier, spécialité). Ex : <em>Boulangerie artisanale bio à Mont-de-Marsan — pains, viennoiseries et pâtisseries maison.</em></p>
                        <p className="mt-1">Décrivez ce qui vous distingue, votre histoire, vos méthodes de travail, votre engagement qualité.</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 mb-1">H3 — Sous-titre optimisé pour les moteurs de recherche</p>
                        <p>Listez vos services, produits ou prestations. Indiquez vos zones d'intervention, vos horaires, vos certifications.</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 mb-1">H2 — Deuxième section avec contenu riche</p>
                        <p>Ajoutez une section sur votre expertise, vos réalisations, vos formations ou vos partenaires.</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 mb-1">H3 — Optimisation des contenus et expérience utilisateur</p>
                        <p>Décrivez l'expérience client, vos engagements, votre démarche qualité, vos avis ou témoignages.</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 mb-1">H2 — Conclusion de la page</p>
                        <p>Terminez par un appel à l'action : coordonnées, incitation à vous contacter, lien vers vos réseaux, zone d'intervention.</p>
                      </div>
                      <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 italic">Utilisez les balises H2/H3 disponibles dans l'éditeur ci-dessous pour structurer votre contenu.</p>
                    </div>
                  )}
                </div>
                <RichTextEditor value={form.description} onChange={v => upd("description", v)} placeholder="Décrivez votre activité, services, savoir-faire…" hideLink />
                {errors.description
                  ? <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  : (() => {
                      const len = form.description.replace(/<[^>]*>/g,"").trim().length;
                      return (
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <span className={len > 2500 ? "text-red-500" : len > 2300 ? "text-orange-500" : "text-gray-400"}>{len}/2 500 caractères</span>
                          {len < 500 && len > 0 && <span className="text-landes-sage">· encore {500 - len} caractères minimum</span>}
                        </p>
                      );
                    })()
                }
              </div>
            </div>

            {/* Logo + Bannière */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xl font-bold text-landes-pine mb-4 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Identité visuelle <span className="text-gray-400 font-normal text-sm">(recommandé)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ImageUploader label="Logo de l'entreprise ou votre photo" hint="Format carré recommandé (400 × 400 px) · JPG, PNG" value={form.logo} onChange={v => upd("logo", v)} aspect="square" />
                <ImageUploader label="Bannière (image de couverture)" hint="Dimensions recommandées : 1400 × 467 px · Format paysage · JPG, PNG" value={form.banner} onChange={v => upd("banner", v)} aspect="banner" />
              </div>
            </div>

            {/* Coordonnées */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xl font-bold text-landes-pine mb-4 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Coordonnées &amp; Accès</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom *</label>
                  <input value={form.firstName} onChange={e => upd("firstName",e.target.value)} className="input-field" placeholder="Jean" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input value={form.lastName} onChange={e => upd("lastName",e.target.value)} className="input-field" placeholder="Dupont" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Email professionnel *</label>
                    <input type="email" value={form.email} onChange={e => upd("email",e.target.value)} className="input-field" placeholder="contact@mon-entreprise.fr" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Téléphone *</label>
                    <input value={form.phone} onChange={e => upd("phone",e.target.value)} className="input-field" placeholder="05 58 00 00 00" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">WhatsApp <span className="text-gray-400 font-normal text-xs">(facultatif)</span></label>
                    <input value={form.whatsapp} onChange={e => upd("whatsapp",e.target.value)} className="input-field" placeholder="06 12 34 56 78" />
                    <p className="text-xs text-gray-400 mt-1">Si renseigné, un bouton WhatsApp apparaîtra sur votre fiche.</p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Adresse *</label>
                  <input value={form.address} onChange={e => upd("address",e.target.value)} className="input-field" placeholder="12 rue de la Forêt" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="label">Code postal *</label>
                  <input value={form.postalCode} onChange={e => upd("postalCode",e.target.value)} className="input-field" placeholder="40000" maxLength={5} />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="label">Commune *</label>
                  <input list="communes-landes" value={form.city} onChange={e => upd("city",e.target.value)} className="input-field" placeholder="Saisir ou choisir une commune…" />
                  <datalist id="communes-landes">{LANDES_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Séparateur — Informations de connexion */}
                <div className="sm:col-span-2 pt-2">
                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-xl font-bold text-landes-pine mb-1 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg inline-block">Informations de connexion à votre tableau de bord</p>
                    <p className="text-xs text-gray-500 mb-4 mt-2">Ces identifiants vous permettront de vous connecter à votre espace professionnel.</p>
                  </div>
                </div>

                <div>
                  <label className="label">Adresse email de connexion *</label>
                  <input type="email" value={form.loginEmail} onChange={e => upd("loginEmail",e.target.value)} className="input-field" placeholder="votre@email.com" />
                  {errors.loginEmail && <p className="text-red-500 text-xs mt-1">{errors.loginEmail}</p>}
                </div>
                <div>
                  <label className="label">Mot de passe *</label>
                  <input type="password" value={form.password} onChange={e => upd("password",e.target.value)} className="input-field" placeholder="8 caractères minimum" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="button" onClick={() => v1() && v2() && setStep(2)} className="btn-primary flex items-center gap-2">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STEP 2 : Choix de la formule ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-landes-pine mb-2">Choisissez votre formule</h2>
            <p className="text-sm text-gray-500 mb-6">Chaque formule inclut les fonctionnalités des formules inférieures. Modifiable à tout moment depuis votre tableau de bord.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all relative ${selectedPlan === plan.id ? "border-landes-forest bg-landes-forest/5 shadow" : "border-gray-200 hover:border-landes-sage"}`}>
                  {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">Populaire</span>}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-lg ${plan.color}`}>{plan.name}</h3>
                    {selectedPlan === plan.id && <CheckCircle className="w-5 h-5 text-landes-forest" />}
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-400 text-sm">/mois</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map(f => <li key={f} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>{f}</li>)}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Options complémentaires */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-landes-pine mb-1">Options complémentaires</h2>
            <p className="text-sm text-gray-500 mb-6">Facultatif. Vous pourrez aussi les activer plus tard depuis votre tableau de bord.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPLEMENTARY_OPTIONS.map(opt => {
                const checked = selectedOptions.includes(opt.id);
                return (
                  <label key={opt.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-landes-forest bg-landes-forest/5" : "border-gray-200 hover:border-landes-sage"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(opt.id)}
                      className="mt-1 w-4 h-4 accent-landes-forest cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-landes-pine text-sm">{opt.label}</p>
                        <p className="text-sm font-bold text-gray-900 flex-shrink-0">{opt.price} <span className="text-xs font-normal text-gray-400">{opt.unit}</span></p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button type="button"
              onClick={() => goNextFromSequence(2)}
              disabled={!selectedPlan}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isLastStepInSequence(2)
                ? <>Finaliser l&apos;inscription <ArrowRight className="w-4 h-4" /></>
                : <>Suivant <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
          {!selectedPlan && <p className="text-xs text-center text-red-400">Veuillez choisir une formule pour continuer.</p>}
        </div>
      )}

      {/* ── STEP 3 : Paiement ── */}
      {step === 3 && selectedPlan && needsPayment && (
        <div className="space-y-6">
          <div className="card p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-landes-pine mb-1">Paiement</h2>
              <p className="text-sm text-gray-500">Récapitulatif de votre commande et choix du règlement.</p>
            </div>

            {/* Récapitulatif */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Récapitulatif de commande</p>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedPlan !== "standard" && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm text-gray-700">Formule <strong className="text-landes-pine">{PLANS.find(p => p.id === selectedPlan)?.name}</strong></p>
                    <p className="text-sm font-semibold text-gray-900">{PLANS.find(p => p.id === selectedPlan)?.price}€/mois</p>
                  </div>
                )}
                {selectedOptions.map(id => {
                  const opt = COMPLEMENTARY_OPTIONS.find(o => o.id === id);
                  if (!opt) return null;
                  return (
                    <div key={id} className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-gray-700">{opt.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{opt.price} <span className="text-xs font-normal text-gray-400">{opt.unit}</span></p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Choix de la méthode de paiement */}
            <div>
              <p className="label mb-2">Méthode de paiement</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentChoice("card")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentChoice === "card" ? "border-landes-forest bg-landes-forest/5" : "border-gray-200 hover:border-landes-sage"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentChoice === "card" ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-500"}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-landes-pine text-sm">Carte bancaire</p>
                    <p className="text-xs text-gray-500">Paiement sécurisé via Stripe</p>
                  </div>
                  {paymentChoice === "card" && <CheckCircle className="w-5 h-5 text-landes-forest ml-auto flex-shrink-0" />}
                </button>
                <button type="button" onClick={() => setPaymentChoice("cheque")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentChoice === "cheque" ? "border-landes-forest bg-landes-forest/5" : "border-gray-200 hover:border-landes-sage"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentChoice === "cheque" ? "bg-landes-forest text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-landes-pine text-sm">Chèque</p>
                    <p className="text-xs text-gray-500">Envoi postal à Prolocal-Landes</p>
                  </div>
                  {paymentChoice === "cheque" && <CheckCircle className="w-5 h-5 text-landes-forest ml-auto flex-shrink-0" />}
                </button>
              </div>
            </div>

            {/* ── Détail : Carte bancaire (Stripe Checkout, mode test) ── */}
            {paymentChoice === "card" && (
              <div className="border-2 border-landes-forest bg-landes-forest/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">MODE TEST</span>
                  <p className="font-semibold text-landes-pine text-sm">Paiement sécurisé via Stripe Checkout</p>
                </div>

                {checkingPayment && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Vérification du paiement en cours…</p>
                )}

                <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Abonnement mensuel</p>
                  <ul className="space-y-1">
                    {selectedPlan !== "standard" && (
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Formule {PLANS.find(p => p.id === selectedPlan)?.name}</span>
                        <span className="text-gray-500">{PLANS.find(p => p.id === selectedPlan)?.price}€/mois</span>
                      </li>
                    )}
                    {selectedOptions.map(id => {
                      const opt = COMPLEMENTARY_OPTIONS.find(o => o.id === id);
                      if (!opt) return null;
                      return (
                        <li key={id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{opt.label}</span>
                          <span className="text-gray-500">{opt.price} {opt.unit}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => startStripeCheckout()}
                    disabled={loading || stripePaid}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60 ${
                      stripePaid ? "bg-green-100 text-green-700" : "bg-landes-forest text-white hover:bg-landes-pine"
                    }`}
                  >
                    {stripePaid
                      ? <><CheckCircle className="w-4 h-4" /> Paiement confirmé</>
                      : <><CreditCard className="w-4 h-4" /> Payer via Stripe</>
                    }
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 pt-1">
                  Utilisez une carte de test Stripe (ex : 4242 4242 4242 4242, date future, CVC quelconque) — aucun débit réel n&apos;est effectué en mode test. Le paiement est vérifié directement auprès de Stripe avant validation.
                </p>
              </div>
            )}

            {/* ── Détail : Chèque ── */}
            {paymentChoice === "cheque" && (
              <div className="border-2 border-landes-forest bg-landes-forest/5 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-landes-forest flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-landes-pine text-sm">Paiement par chèque</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Réglez votre commande par chèque à l&apos;ordre de <strong>Prolocal-Landes</strong>, à envoyer à l&apos;adresse suivante :
                  </p>
                  <p className="text-sm text-gray-700 mt-2 bg-white rounded-lg border border-gray-100 px-3 py-2">
                    Prolocal-Landes<br />
                    12 rue de la Forêt<br />
                    40000 Mont-de-Marsan
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Merci d&apos;indiquer le nom de votre entreprise au dos du chèque. Votre fiche sera activée dès réception du règlement.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => goPrevFromSequence(3)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button type="button" onClick={() => goNextFromSequence(3)} disabled={loading || (paymentChoice === "card" && !stripePaid)}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation…</>
                : <>Valider le paiement <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
          {paymentChoice === "card" && !stripePaid && (
            <p className="text-xs text-center text-red-400">Merci de finaliser le paiement Stripe ci-dessus avant de continuer.</p>
          )}
        </div>
      )}

      {/* ── STEP pub : Encart publicitaire ciblé ── */}
      {step === "pub" && (
        <div className="space-y-6">
          <div className="card p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-landes-pine mb-1 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg inline-block">Encart publicitaire ciblé</h2>
              <p className="text-sm text-gray-500 mt-2">Téléchargez l&apos;image de votre bannière publicitaire, affichée sur la page de votre catégorie pendant 1 mois.</p>
            </div>
            <ImageUploader label="Bannière publicitaire" hint="Format JPG ou PNG · 1200 × 400 px recommandé" value={pubImage} onChange={setPubImage} aspect="banner" />
            <p className="text-xs text-gray-400">Si vous ne disposez pas de votre bannière, vous pourrez la télécharger ultérieurement depuis votre tableau de bord.</p>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => goPrevFromSequence("pub")} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button type="button" onClick={() => goNextFromSequence("pub")} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isLastStepInSequence("pub")
                ? (loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation…</> : <>Finaliser l&apos;inscription <ArrowRight className="w-4 h-4" /></>)
                : <>Suivant <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── STEP seo : Service de rédaction SEO ── */}
      {step === "seo" && (
        <div className="space-y-6">
          <div className="card p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-landes-pine mb-1 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg inline-block">Service de rédaction SEO</h2>
              <p className="text-sm text-gray-500 mt-2">Choisissez 2 mots-clés sur lesquels vous souhaitez optimiser le référencement de votre fiche.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1].map(i => (
                <div key={i}>
                  <label className="label">Mot-clé {i + 1} *</label>
                  <input
                    value={seoKeywords[i] || ""}
                    onChange={e => { const next = [...seoKeywords]; next[i] = e.target.value; setSeoKeywords(next); }}
                    className="input-field"
                    placeholder={i === 0 ? "Ex : plombier Dax" : "Ex : dépannage urgence"}
                    maxLength={40}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => goPrevFromSequence("seo")} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button type="button"
              onClick={() => goNextFromSequence("seo")}
              disabled={!seoKeywords[0]?.trim() || !seoKeywords[1]?.trim() || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isLastStepInSequence("seo")
                ? (loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation…</> : <>Finaliser l&apos;inscription <ArrowRight className="w-4 h-4" /></>)
                : <>Suivant <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
          {(!seoKeywords[0]?.trim() || !seoKeywords[1]?.trim()) && (
            <p className="text-xs text-center text-red-400">Veuillez renseigner les 2 mots-clés pour continuer.</p>
          )}
        </div>
      )}

      {/* ── STEP 4 : Options selon la formule ── */}
      {step === 4 && selectedPlan && (
        <div className="space-y-6">
          <div className="card p-8 space-y-6 border border-landes-sage/30">
            <div>
              <h2 className="text-xl font-bold text-landes-pine mb-1 flex items-center gap-2 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">
                {selectedPlan !== "standard" && (
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${selectedPlan === "gold" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>
                    {selectedPlan === "gold" ? "Gold" : "Premium"}
                  </span>
                )}
                Complétez votre fiche
              </h2>
              <p className="text-sm text-gray-500">Ces informations apparaîtront sur votre fiche publique. Toutes sont modifiables depuis votre tableau de bord.</p>
            </div>

            {/* Services (Premium : 1, Gold : 3) */}
            {selectedPlan !== "standard" && (
            <div className="pb-5 border-b border-gray-100 space-y-3">
              <div>
                <label className="label">
                  {selectedPlan === "gold" ? "Vos 3 services" : "Votre service principal"}
                  <span className="text-gray-400 font-normal ml-1">(3 mots maximum par service)</span>
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedPlan === "gold"
                    ? "Ajoutez jusqu'à 3 services clés — ils s'afficheront sous forme de badges sur votre fiche."
                    : "Ajoutez 1 service clé — il s'affichera sous forme de badge sur votre fiche."}
                </p>
              </div>
              <div className={`grid gap-3 ${selectedPlan === "gold" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                {Array.from({ length: selectedPlan === "gold" ? 3 : 1 }).map((_, i) => {
                  const colors = [
                    "border-landes-forest/40 focus:border-landes-forest bg-landes-forest/5",
                    "border-landes-sage/40 focus:border-landes-sage bg-landes-sage/5",
                    "border-amber-400/50 focus:border-amber-500 bg-amber-50",
                  ];
                  const previews = ["bg-landes-forest text-white","bg-landes-sage text-white","bg-amber-500 text-white"];
                  const svc = services[i] || "";
                  return (
                    <div key={i} className="space-y-1.5">
                      <input type="text" value={svc}
                        placeholder={`Service ${i + 1} (ex: Livraison express)`}
                        maxLength={30}
                        onChange={e => {
                          const words = e.target.value.trim().split(/\s+/);
                          if (words.length <= 3) { const next = [...services]; next[i] = e.target.value; setServices(next); }
                        }}
                        className={`input-field text-sm border ${colors[i]}`}
                      />
                      {svc.trim() && (
                        <div className="flex">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${previews[i]}`}>{svc.trim()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* Réseaux sociaux */}
            <div className="pb-5 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Site internet <span className="text-gray-400 font-normal">(facultatif)</span></label>
                <input value={form.website} onChange={e => upd("website", e.target.value)} className="input-field" placeholder="https://mon-site.fr" />
              </div>
              <div>
                <label className="label">Instagram <span className="text-gray-400 font-normal">(facultatif)</span></label>
                <input value={form.socialLink} onChange={e => upd("socialLink", e.target.value)} className="input-field" placeholder="https://instagram.com/monentreprise" />
              </div>
              {selectedPlan === "gold" && (
                <>
                  <div>
                    <label className="label">Facebook <span className="text-gray-400 font-normal">(facultatif)</span></label>
                    <input value={form.facebookLink} onChange={e => upd("facebookLink", e.target.value)} className="input-field" placeholder="https://facebook.com/monentreprise" />
                  </div>
                  <div>
                    <label className="label">TikTok <span className="text-gray-400 font-normal">(facultatif)</span></label>
                    <input value={form.tiktokLink} onChange={e => upd("tiktokLink", e.target.value)} className="input-field" placeholder="https://tiktok.com/@monentreprise" />
                  </div>
                </>
              )}
            </div>

            {/* Horaires */}
            <div className="pb-5 border-b border-gray-100 space-y-3">
              <div>
                <p className="text-xl font-bold text-landes-pine mb-1 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg inline-block">Horaires d&apos;ouverture</p>
                <p className="text-xs text-gray-400 mt-2">Définissez vos plages horaires. Modifiables depuis votre tableau de bord.</p>
              </div>
              <OpeningHoursEditor value={hours} onChange={setHours} />
            </div>

            {/* Photos */}
            <div>
              <p className="text-xl font-bold text-landes-pine mb-3 bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg inline-block">Photos d&apos;entreprise</p>
              <PhotosUploader photos={photos} onChange={setPhotos} />
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => goPrevFromSequence(4)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button type="button" onClick={() => goNextFromSequence(4)} disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isLastStepInSequence(4)
                ? (loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation…</> : <>Finaliser l&apos;inscription <ArrowRight className="w-4 h-4" /></>)
                : <>Suivant : Paiement <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Modale SIREN déjà inscrit ── */}
      {showDuplicateSirenModal && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowDuplicateSirenModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-landes-pine">SIREN déjà inscrit</p>
                <p className="text-sm text-gray-600 mt-1">
                  Vous souhaitez inscrire un établissement secondaire ?{" "}
                  <Link
                    href="/contact"
                    className="text-landes-forest font-semibold underline hover:text-landes-pine"
                  >
                    Contactez-nous !
                  </Link>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDuplicateSirenModal(false)}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Chargement…</div>}>
      <InscriptionForm />
    </Suspense>
  );
}
