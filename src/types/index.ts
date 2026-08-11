export type PlanType   = "standard" | "premium" | "gold";
export type StatusType = "pending"  | "active"  | "suspended" | "rejected";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Professional {
  id: string;
  companyName: string;
  siren: string;
  siret?: string;
  legalForm: string;
  category: string;
  subcategory?: string;
  activityTitle?: string;
  description: string;
  website?: string;
  socialLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  lat?: number;
  lng?: number;
  plan: PlanType;
  status: StatusType;
  logo?: string;
  banner?: string;
  photos?: string[];
  services?: string[];   // 3 services max, 3 mots max chacun
  openingHours?: OpeningHours;
  // Agenda / RDV
  agendaEnabled?: boolean;
  agendaSlotDuration?: number;   // minutes : 15, 30, 45, 60
  agendaStartTime?: string;      // "08:00"
  agendaEndTime?: string;        // "19:00"
  agendaDays?: number[];         // [1,2,3,4,5] = lun-ven
  agendaMessage?: string;        // Message affiché sur le widget
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  password?: string;
}

export interface Appointment {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalEmail: string;
  // Visiteur
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  visitorMessage?: string;
  // Créneau
  date: string;       // "2024-03-15"
  time: string;       // "10:30"
  duration: number;   // minutes
  // Statut
  status: AppointmentStatus;
  createdAt: string;
}

export interface Visit {
  proId:     string;
  date:      string;   // "YYYY-MM-DD"
  hour:      number;   // 0–23
  source:    "direct" | "search" | "category" | "map";
  city?:     string;
}

export interface DailyStats {
  date:   string;
  visits: number;
}

export interface Review {
  id: string;
  proId: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;       // 1–5
  text: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  reply?: string;       // réponse du professionnel
  repliedAt?: string;
  flagged?: boolean;    // signalé comme abusif
  flaggedAt?: string;
}

export interface BlockedDate {
  id: string;
  professionalId: string;
  date: string;           // "2024-12-25"
  allDay: boolean;
  startTime?: string;     // si allDay=false : "09:00"
  endTime?: string;       // si allDay=false : "12:00"
  reason: string;         // "Congés", "Formation", "Absent", "Férié"...
}

export interface OpeningHours {
  alwaysOpen?: boolean;
  monday?:    DayHours;
  tuesday?:   DayHours;
  wednesday?: DayHours;
  thursday?:  DayHours;
  friday?:    DayHours;
  saturday?:  DayHours;
  sunday?:    DayHours;
}

export interface DayHours {
  closed: boolean;
  // Matin
  morningOpen?:  string;
  morningClose?: string;
  // Après-midi
  afternoonOpen?:  string;
  afternoonClose?: string;
  // Legacy simple (kept for backward compat)
  open?:  string;
  close?: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: string[];
  highlight?: boolean;
  color: string;
  bgColor: string;
}

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: 9,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    features: [
      "Fiche entreprise basique",
      "Coordonnées et adresse",
      "Catégorie professionnelle",
      "Visible dans l'annuaire",
      "Logo et bannière",
      "Collecte d'avis clients",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    highlight: true,
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    features: [
      "Tout le Standard",
      "5 photos ou images d'illustration",
      "Horaires matin / après-midi",
      "Lien vers votre site web",
      "Mise en avant dans les résultats",
      "Affichage d'1 service",
      "Lien vers 1 réseau social",
      "Collecte d'avis clients",
      "Insertion de vos avis Google",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 35,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    features: [
      "Tout le Premium",
      "Position prioritaire",
      "Emplacement professionnel à la une",
      "Affichage de 3 services",
      "Support prioritaire",
      "Statistiques de visite",
      "Éditeur de devis & facture (facturation électronique)",
      "Gestionnaire de clients (CRM)",
    ],
  },
];

export const CATEGORIES = [
  "Alimentation & Épicerie",
  "Artisanat & Métiers d'art",
  "Bâtiment & Travaux",
  "Beauté & Bien-être",
  "Commerce & Vente",
  "Culture & Loisirs",
  "Éducation & Formation",
  "Hébergement & Tourisme",
  "Hôtellerie & Restauration",
  "Immobilier",
  "Informatique & Numérique",
  "Médical & Paramédical",
  "Nature & Agriculture",
  "Services à la personne",
  "Sport & Fitness",
  "Transport & Logistique",
];

export const LANDES_CITIES = [
  "Mont-de-Marsan",
  "Dax",
  "Biscarrosse",
  "Mimizan",
  "Parentis-en-Born",
  "Morcenx",
  "Labouheyre",
  "Castets",
  "Saint-Vincent-de-Tyrosse",
  "Peyrehorade",
  "Hagetmau",
  "Aire-sur-l'Adour",
  "Grenade-sur-l'Adour",
  "Tartas",
  "Soustons",
  "Hossegor",
  "Capbreton",
  "Vieux-Boucau-les-Bains",
  "Sabres",
  "Lit-et-Mixe",
  "Autre commune des Landes",
];

/** Formate les horaires d'un jour en chaîne lisible */
export function formatDayHours(h: DayHours): string {
  if (h.closed) return "Fermé";
  const parts: string[] = [];
  if (h.morningOpen && h.morningClose)
    parts.push(`${h.morningOpen}–${h.morningClose}`);
  if (h.afternoonOpen && h.afternoonClose)
    parts.push(`${h.afternoonOpen}–${h.afternoonClose}`);
  // legacy
  if (!parts.length && h.open && h.close)
    parts.push(`${h.open}–${h.close}`);
  return parts.length ? parts.join(" / ") : "—";
}

// ── Facturation ────────────────────────────────────────────────
export type DocumentType   = "devis" | "facture" | "avoir";
export type DocumentStatus = "brouillon" | "envoyé" | "accepté" | "refusé" | "payé" | "annulé";

export interface DocumentLine {
  id:          string;
  description: string;
  quantity:    number;
  unit:        string;   // ex: "h", "unité", "forfait"
  unitPrice:   number;   // HT
  vatRate:     number;   // 0, 5.5, 10, 20
}

export interface BillingDocument {
  id:            string;
  proId:         string;
  type:          DocumentType;
  status:        DocumentStatus;
  number:        string;   // ex: "DEV-2024-001"
  linkedTo?:     string;   // id du devis (pour facture) ou facture (pour avoir)
  issueDate:     string;   // YYYY-MM-DD
  validityDate?: string;   // pour devis
  dueDate?:      string;   // pour factures
  client: {
    firstName:  string;
    lastName:   string;
    company?:   string;   // Entreprise / Raison sociale (facultatif)
    name:       string;   // calculé : firstName + lastName ou company
    address:    string;
    postalCode: string;
    city:       string;
    email?:     string;
    phone?:     string;
    siret?:     string;
    vatNumber?: string;   // N° TVA intracommunautaire
  };
  issuer: {
    name:        string;
    address:     string;
    postalCode:  string;
    city:        string;
    email:       string;
    phone:       string;
    siren:       string;
    legalForm:   string;
    vatNumber?:  string;   // n° TVA intracommunautaire
    rcs?:        string;   // ex: "RCS Mont-de-Marsan"
    capital?:    string;   // pour SARL/SAS etc.
    ape?:        string;   // code APE/NAF
  };
  lines:         DocumentLine[];
  discountPct?:  number;    // remise globale %
  notes?:        string;
  paymentTerms?: string;    // "30 jours date de facture"
  paymentMethod?:string;    // "Virement bancaire / Chèque"
  bankDetails?:  string;    // IBAN + BIC
  penalty?:      string;    // pénalités de retard
  lateInterest?: string;    // "3× taux légal"
  recoveryFee?:  string;    // "40€ indemnité forfaitaire"
  createdAt:     string;
  updatedAt:     string;
}

// ── CRM Clients ────────────────────────────────────────────────
export type ClientStatus = "prospect" | "actif" | "inactif" | "vip";

export interface ClientNote {
  id:        string;
  date:      string;
  content:   string;
  type:      "note" | "appel" | "email" | "rdv" | "devis" | "facture";
}

export interface Client {
  id:          string;
  proId:       string;
  // Identité
  firstName:   string;
  lastName:    string;
  company?:    string;
  // Contact
  email?:      string;
  phone?:      string;
  mobile?:     string;
  // Adresse
  address?:    string;
  postalCode?: string;
  city?:       string;
  // Commercial
  status:      ClientStatus;
  source?:     string;   // "annuaire" | "bouche-à-oreille" | "site web" | "réseaux sociaux" | autre
  tags?:       string[];
  // Financier
  siret?:      string;
  vatNumber?:  string;
  // Suivi
  notes:       ClientNote[];
  createdAt:   string;
  updatedAt:   string;
}
