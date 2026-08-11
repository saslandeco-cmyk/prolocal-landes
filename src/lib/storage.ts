import { Professional } from "@/types";

const STORAGE_KEY  = "prolocal_professionals";
const ADMIN_KEY    = "prolocal_admin";
const SESSION_KEY  = "prolocal_session";
const IMG_PREFIX   = "prolocal_img_";   // images stockées séparément

const DEFAULT_ADMIN = { email: "admin@prolocal-landes.fr", password: "Admin2024!" };

// ── Helpers ───────────────────────────────────────────────────

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e instanceof DOMException) {
      console.warn(`[storage] QuotaExceeded for key "${key}"`);
    }
    return false;
  }
}

// ── Image store : logo / banner / photos stockés à part ───────

function imgKey(proId: string, type: string) {
  return `${IMG_PREFIX}${proId}_${type}`;
}

function saveImage(proId: string, type: string, data: string | undefined) {
  const k = imgKey(proId, type);
  if (!data) { localStorage.removeItem(k); return; }
  safeSet(k, data);
}

function loadImage(proId: string, type: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(imgKey(proId, type)) || undefined;
}

function savePhotos(proId: string, photos: string[] | undefined) {
  // Vider les anciennes
  for (let i = 0; i < 5; i++) localStorage.removeItem(imgKey(proId, `photo${i}`));
  if (!photos?.length) return;
  photos.slice(0, 5).forEach((p, i) => safeSet(imgKey(proId, `photo${i}`), p));
}

function loadPhotos(proId: string): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  const out: string[] = [];
  for (let i = 0; i < 5; i++) {
    const v = localStorage.getItem(imgKey(proId, `photo${i}`));
    if (v) out.push(v);
  }
  return out.length ? out : undefined;
}

function deleteImages(proId: string) {
  localStorage.removeItem(imgKey(proId, "logo"));
  localStorage.removeItem(imgKey(proId, "banner"));
  for (let i = 0; i < 5; i++) localStorage.removeItem(imgKey(proId, `photo${i}`));
}

// ── Rehydrate : injecte les images dans un pro depuis le store ─
function rehydrate(pro: Professional): Professional {
  return {
    ...pro,
    logo:   loadImage(pro.id, "logo")   ?? pro.logo,
    banner: loadImage(pro.id, "banner") ?? pro.banner,
    photos: loadPhotos(pro.id)          ?? pro.photos,
  };
}

// ── Professionals ─────────────────────────────────────────────

export function getProfessionals(): Professional[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  const list: Professional[] = data ? (() => { try { return JSON.parse(data); } catch { return []; } })() : getSampleData();
  return list.map(rehydrate);
}

export function saveProfessional(pro: Professional): void {
  // Séparer les images du reste
  const { logo, banner, photos, ...rest } = pro;

  // Sauvegarder les images à part
  saveImage(pro.id, "logo",   logo   || undefined);
  saveImage(pro.id, "banner", banner || undefined);
  savePhotos(pro.id, photos?.length ? photos : undefined);

  // Sauvegarder le pro sans les images (payload léger)
  const lean: Professional = { ...rest, logo: undefined, banner: undefined, photos: undefined };
  const pros = getProfessionals().map(p => ({ ...p, logo: undefined, banner: undefined, photos: undefined }));
  const idx = pros.findIndex(p => p.id === lean.id);
  if (idx >= 0) { pros[idx] = lean; } else { pros.push(lean); }

  if (!safeSet(STORAGE_KEY, JSON.stringify(pros))) {
    console.warn("[storage] Failed to save professionals list.");
  }
}

export function deleteProfessional(id: string): void {
  deleteImages(id);
  const pros = getProfessionals()
    .map(p => ({ ...p, logo: undefined, banner: undefined, photos: undefined }))
    .filter(p => p.id !== id);
  safeSet(STORAGE_KEY, JSON.stringify(pros));
}

export function getProfessionalById(id: string): Professional | null {
  const p = getProfessionals().find(p => p.id === id);
  return p ? rehydrate(p) : null;
}

export function getProfessionalByEmail(email: string): Professional | null {
  const p = getProfessionals().find(p => p.email === email);
  return p ? rehydrate(p) : null;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Session ───────────────────────────────────────────────────

export function setSession(type: "pro" | "admin", id?: string): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ type, id, ts: Date.now() }));
}

export function getSession(): { type: "pro" | "admin"; id?: string } | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

// ── Admin ─────────────────────────────────────────────────────

export function checkAdminCredentials(email: string, password: string): boolean {
  const stored = localStorage.getItem(ADMIN_KEY);
  const admin = stored ? JSON.parse(stored) : DEFAULT_ADMIN;
  return admin.email === email && admin.password === password;
}

// ── Sample data ───────────────────────────────────────────────

function getSampleData(): Professional[] {
  const samples: Professional[] = [
    {
      id: "demo1", companyName: "Boulangerie des Pins",
      siren: "123456789", legalForm: "SARL", category: "Alimentation & Épicerie",
      description: "Boulangerie artisanale au cœur de Mont-de-Marsan, spécialisée dans les pains au levain et viennoiseries maison depuis 1987. Farines locales, four à bois.",
      firstName: "Jean", lastName: "Dupont",
      email: "boulangerie@example.com", password: "demo123",
      phone: "05 58 12 34 56", address: "12 rue de la Forêt", city: "Mont-de-Marsan", postalCode: "40000",
      lat: 43.8914, lng: -0.5006, plan: "gold", status: "active",
      website: "https://boulangerie-des-pins.fr",
      createdAt: new Date(Date.now() - 30*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 28*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "07:00", close: "13:00", closed: false },
        tuesday:   { open: "07:00", close: "13:00", closed: false },
        wednesday: { open: "07:00", close: "13:00", closed: false },
        thursday:  { open: "07:00", close: "13:00", closed: false },
        friday:    { open: "07:00", close: "19:00", closed: false },
        saturday:  { open: "07:00", close: "13:30", closed: false },
        sunday:    { open: "08:00", close: "12:30", closed: false },
      },
    },
    {
      id: "demo2", companyName: "Menuiserie Labrouche",
      siren: "987654321", legalForm: "Auto-entrepreneur", category: "Bâtiment & Travaux",
      description: "Artisan menuisier depuis 15 ans à Dax, spécialisé dans la fabrication sur mesure, la pose de parquets et la rénovation intérieure. Devis gratuit.",
      firstName: "Pierre", lastName: "Labrouche",
      email: "menuiserie@example.com", password: "demo123",
      phone: "05 58 98 76 54", address: "8 chemin des Artisans", city: "Dax", postalCode: "40100",
      lat: 43.7101, lng: -1.0527, plan: "premium", status: "active",
      createdAt: new Date(Date.now() - 60*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 58*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "08:00", close: "18:00", closed: false },
        tuesday:   { open: "08:00", close: "18:00", closed: false },
        wednesday: { open: "08:00", close: "18:00", closed: false },
        thursday:  { open: "08:00", close: "18:00", closed: false },
        friday:    { open: "08:00", close: "17:00", closed: false },
        saturday:  { open: "09:00", close: "12:00", closed: false },
        sunday:    { open: "", close: "", closed: true },
      },
    },
    {
      id: "demo3", companyName: "Surf School Biscarrosse",
      siren: "456123789", legalForm: "SAS", category: "Sport & Fitness",
      description: "École de surf professionnelle sur la côte atlantique. Cours collectifs et particuliers pour tous niveaux. Location de matériel. Stages vacances.",
      firstName: "Marie", lastName: "Océane",
      email: "surf@example.com", password: "demo123",
      phone: "05 58 45 67 89", address: "Avenue de la Plage", city: "Biscarrosse", postalCode: "40600",
      lat: 44.4524, lng: -1.2502, plan: "premium", status: "active",
      website: "https://surf-biscarrosse.fr",
      createdAt: new Date(Date.now() - 15*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 13*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "09:00", close: "19:00", closed: false },
        tuesday:   { open: "09:00", close: "19:00", closed: false },
        wednesday: { open: "09:00", close: "19:00", closed: false },
        thursday:  { open: "09:00", close: "19:00", closed: false },
        friday:    { open: "09:00", close: "20:00", closed: false },
        saturday:  { open: "08:00", close: "20:00", closed: false },
        sunday:    { open: "08:00", close: "20:00", closed: false },
      },
    },
    {
      id: "demo4", companyName: "Gîte de la Pinède",
      siren: "789456123", legalForm: "EURL", category: "Hébergement & Tourisme",
      description: "Gîte rustique et chaleureux en pleine forêt landaise à Mimizan. Capacité 8 personnes, piscine, barbecue, à 10 min des plages. Idéal familles.",
      firstName: "Sophie", lastName: "Martin",
      email: "gite@example.com", password: "demo123",
      phone: "06 12 34 56 78", address: "Route des Lacs", city: "Mimizan", postalCode: "40200",
      lat: 44.2033, lng: -1.2297, plan: "standard", status: "active",
      createdAt: new Date(Date.now() - 45*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: new Date(Date.now() - 43*24*3600000).toISOString(),
      openingHours: {
        monday:    { open: "09:00", close: "18:00", closed: false },
        tuesday:   { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday:  { open: "09:00", close: "18:00", closed: false },
        friday:    { open: "09:00", close: "18:00", closed: false },
        saturday:  { open: "10:00", close: "17:00", closed: false },
        sunday:    { open: "", close: "", closed: true },
      },
    },
    {
      id: "demo5", companyName: "Cabinet Vétérinaire Landes Sud",
      siren: "321654987", legalForm: "SCP", category: "Médical & Paramédical",
      description: "Cabinet vétérinaire pour animaux de compagnie et animaux de ferme à Capbreton. Service d'urgence 7j/7. Chirurgie, vaccinations, consultations.",
      firstName: "Docteur", lastName: "Berrois",
      email: "veto@example.com", password: "demo123",
      phone: "05 58 33 44 55", address: "15 avenue de la République", city: "Capbreton", postalCode: "40130",
      lat: 43.6429, lng: -1.4292, plan: "standard", status: "pending",
      createdAt: new Date(Date.now() - 2*24*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  safeSet(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

// ── Appointments ──────────────────────────────────────────────
const APPT_KEY = "prolocal_appointments";

export function getAppointments(): import("@/types").Appointment[] {
  if (typeof window === "undefined") return [];
  const d = localStorage.getItem(APPT_KEY);
  return d ? JSON.parse(d) : [];
}

export function getAppointmentsByPro(proId: string): import("@/types").Appointment[] {
  return getAppointments().filter(a => a.professionalId === proId);
}

export function saveAppointment(appt: import("@/types").Appointment): void {
  const all = getAppointments();
  const idx = all.findIndex(a => a.id === appt.id);
  if (idx >= 0) { all[idx] = appt; } else { all.push(appt); }
  safeSet(APPT_KEY, JSON.stringify(all));
}

export function deleteAppointment(id: string): void {
  safeSet(APPT_KEY, JSON.stringify(getAppointments().filter(a => a.id !== id)));
}

export function getBookedSlots(proId: string, date: string): string[] {
  return getAppointments()
    .filter(a => a.professionalId === proId && a.date === date && a.status !== "cancelled")
    .map(a => a.time);
}

// ── Blocked dates ─────────────────────────────────────────────
const BLOCKED_KEY = "prolocal_blocked_dates";

export function getBlockedDates(): import("@/types").BlockedDate[] {
  if (typeof window === "undefined") return [];
  const d = localStorage.getItem(BLOCKED_KEY);
  return d ? JSON.parse(d) : [];
}

export function getBlockedDatesByPro(proId: string): import("@/types").BlockedDate[] {
  return getBlockedDates().filter(b => b.professionalId === proId);
}

export function saveBlockedDate(blocked: import("@/types").BlockedDate): void {
  const all = getBlockedDates();
  const idx = all.findIndex(b => b.id === blocked.id);
  if (idx >= 0) { all[idx] = blocked; } else { all.push(blocked); }
  safeSet(BLOCKED_KEY, JSON.stringify(all));
}

export function deleteBlockedDate(id: string): void {
  safeSet(BLOCKED_KEY, JSON.stringify(getBlockedDates().filter(b => b.id !== id)));
}

export function isDateBlocked(proId: string, date: string, time?: string): boolean {
  const blocked = getBlockedDatesByPro(proId).filter(b => b.date === date);
  if (!blocked.length) return false;
  return blocked.some(b => {
    if (b.allDay) return true;
    if (!time || !b.startTime || !b.endTime) return false;
    const [th, tm] = time.split(":").map(Number);
    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);
    const t = th * 60 + tm;
    return t >= sh * 60 + sm && t < eh * 60 + em;
  });
}

// ── Reviews ──────────────────────────────────────────────────────
const REVIEWS_KEY = "prolocal_reviews";

import type { Review } from "@/types";

export function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(REVIEWS_KEY);
  try { return data ? JSON.parse(data) : []; } catch { return []; }
}

export function getReviewsByPro(proId: string): Review[] {
  return getReviews().filter(r => r.proId === proId);
}

export function getApprovedReviewsByPro(proId: string): Review[] {
  return getReviews().filter(r => r.proId === proId && r.status === "approved");
}

export function saveReview(review: Review): void {
  const all = getReviews();
  const idx = all.findIndex(r => r.id === review.id);
  if (idx >= 0) all[idx] = review; else all.push(review);
  safeSet(REVIEWS_KEY, JSON.stringify(all));
}

export function deleteReview(id: string): void {
  safeSet(REVIEWS_KEY, JSON.stringify(getReviews().filter(r => r.id !== id)));
}

export function flagReview(id: string): void {
  const all = getReviews();
  const idx = all.findIndex(r => r.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], flagged: true, flaggedAt: new Date().toISOString() };
    safeSet(REVIEWS_KEY, JSON.stringify(all));
  }
}

export function reviewExists(proId: string, email: string, firstName: string, lastName: string): boolean {
  return getReviews().some(r =>
    r.proId === proId &&
    r.email.toLowerCase() === email.toLowerCase() &&
    r.firstName.toLowerCase() === firstName.toLowerCase() &&
    r.lastName.toLowerCase() === lastName.toLowerCase()
  );
}

// ── Visits / Statistics ──────────────────────────────────────────
const VISITS_KEY = "prolocal_visits";

import type { Visit, DailyStats } from "@/types";

export function getVisits(): Visit[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(VISITS_KEY) || "[]"); } catch { return []; }
}

export function getVisitsByPro(proId: string): Visit[] {
  return getVisits().filter(v => v.proId === proId);
}

export function recordVisit(proId: string, source: Visit["source"] = "direct"): void {
  if (typeof window === "undefined") return;
  const now  = new Date();
  const date = now.toISOString().slice(0, 10);
  const hour = now.getHours();

  // Déduplique : 1 visite max par proId + date + heure par session
  const sessionKey = `visit_${proId}_${date}_${hour}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, "1");

  const visit: Visit = { proId, date, hour, source };
  const all = getVisits();
  all.push(visit);
  // Conserver max 1000 visites par pro pour ne pas surcharger le localStorage
  const proVisits = all.filter(v => v.proId === proId);
  if (proVisits.length > 1000) {
    const toRemove = proVisits.length - 1000;
    let removed = 0;
    const trimmed = all.filter(v => {
      if (v.proId === proId && removed < toRemove) { removed++; return false; }
      return true;
    });
    safeSet(VISITS_KEY, JSON.stringify(trimmed));
  } else {
    safeSet(VISITS_KEY, JSON.stringify(all));
  }
}

export function getStatsByPro(proId: string, days = 30): {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byDay: DailyStats[];
  byHour: number[];
  bySource: Record<Visit["source"], number>;
} {
  const visits = getVisitsByPro(proId);
  const now    = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo  = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

  // By day (last `days` days)
  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  visits.forEach(v => { if (dayMap[v.date] !== undefined) dayMap[v.date]++; });
  const byDay: DailyStats[] = Object.entries(dayMap).map(([date, visits]) => ({ date, visits }));

  // By hour
  const byHour = Array(24).fill(0);
  visits.forEach(v => { byHour[v.hour]++; });

  // By source
  const bySource: Record<Visit["source"], number> = { direct: 0, search: 0, category: 0, map: 0 };
  visits.forEach(v => { bySource[v.source]++; });

  return {
    total:     visits.length,
    today:     visits.filter(v => v.date === todayStr).length,
    thisWeek:  visits.filter(v => new Date(v.date) >= weekAgo).length,
    thisMonth: visits.filter(v => new Date(v.date) >= monthAgo).length,
    byDay,
    byHour,
    bySource,
  };
}

// ── Facturation ──────────────────────────────────────────────────
const DOCS_KEY = "prolocal_documents";

import type { BillingDocument } from "@/types";

export function getDocuments(): BillingDocument[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || "[]"); } catch { return []; }
}

export function getDocumentsByPro(proId: string): BillingDocument[] {
  return getDocuments().filter(d => d.proId === proId);
}

export function saveDocument(doc: BillingDocument): void {
  const all = getDocuments();
  const idx = all.findIndex(d => d.id === doc.id);
  if (idx >= 0) all[idx] = doc; else all.push(doc);
  safeSet(DOCS_KEY, JSON.stringify(all));
}

export function deleteDocument(id: string): void {
  safeSet(DOCS_KEY, JSON.stringify(getDocuments().filter(d => d.id !== id)));
}

export function getNextNumber(proId: string, type: BillingDocument["type"]): string {
  const prefix = type === "devis" ? "DEV" : type === "avoir" ? "AVO" : "FAC";
  const year   = new Date().getFullYear();
  const docs   = getDocuments().filter(d => d.proId === proId && d.type === type);
  const seq    = (docs.length + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${seq}`;
}

// ── Billing Profile (informations émetteur) ──────────────────────
const BILLING_PROFILE_KEY = "prolocal_billing_profile";

export interface BillingProfile {
  proId:        string;
  // Identification
  companyName:  string;   // Dénomination sociale ou nom+prénom
  legalForm:    string;   // SARL, SAS, Auto-entrepreneur, EI…
  siren:        string;   // SIREN 9 chiffres
  siret?:       string;   // SIRET 14 chiffres (établissement)
  rcs?:         string;   // ex: "RCS Mont-de-Marsan B 123 456 789"
  rm?:          string;   // Répertoire des métiers (artisans)
  capital?:     string;   // Capital social (SARL/SAS)
  ape?:         string;   // Code APE/NAF ex: "6201Z"
  vatNumber?:   string;   // N° TVA intracommunautaire
  vatSubject:   boolean;  // Assujetti à la TVA ?
  // Coordonnées
  address:      string;
  postalCode:   string;
  city:         string;
  email:        string;
  phone:        string;
  website?:     string;
  // Paiement
  bankDetails?: string;   // IBAN + BIC
  paymentTerms?:string;   // "30 jours date de facture"
  // Mentions légales
  penalty?:     string;
  recoveryFee?: string;
}

export function getBillingProfile(proId: string): BillingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(BILLING_PROFILE_KEY) || "{}");
    return all[proId] || null;
  } catch { return null; }
}

export function saveBillingProfile(profile: BillingProfile): void {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(BILLING_PROFILE_KEY) || "{}");
    all[profile.proId] = profile;
    safeSet(BILLING_PROFILE_KEY, JSON.stringify(all));
  } catch { /* silencieux */ }
}

// ── CRM Clients ──────────────────────────────────────────────────
const CLIENTS_KEY = "prolocal_clients";

import type { Client } from "@/types";

export function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || "[]"); } catch { return []; }
}

export function getClientsByPro(proId: string): Client[] {
  return getClients().filter(c => c.proId === proId);
}

export function getClientById(id: string): Client | null {
  return getClients().find(c => c.id === id) || null;
}

export function saveClient(client: Client): void {
  const all = getClients();
  const idx = all.findIndex(c => c.id === client.id);
  if (idx >= 0) all[idx] = client; else all.push(client);
  safeSet(CLIENTS_KEY, JSON.stringify(all));
}

export function deleteClient(id: string): void {
  safeSet(CLIENTS_KEY, JSON.stringify(getClients().filter(c => c.id !== id)));
}

// ── Hero image ────────────────────────────────────────────────────
const HERO_IMAGE_KEY = "prolocal_hero_image";

export function getHeroImage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(HERO_IMAGE_KEY);
}

export function saveHeroImage(dataUrl: string): void {
  if (typeof window === "undefined") return;
  safeSet(HERO_IMAGE_KEY, dataUrl);
}

export function deleteHeroImage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HERO_IMAGE_KEY);
}
