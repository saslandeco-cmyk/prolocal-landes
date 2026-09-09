/**
 * Vérification d'identité par code email pour certifier la légitimité des avis.
 *
 * Fonctionnement :
 * 1. Avant de publier son avis, l'internaute reçoit un code à 6 chiffres envoyé
 *    à l'adresse email renseignée dans le formulaire.
 * 2. Il doit saisir ce code pour confirmer que l'adresse lui appartient réellement.
 * 3. Une fois le code validé, l'avis est enregistré avec `verified: true`,
 *    ce qui affiche un badge "Avis vérifié" sur la fiche publique.
 *
 * NOTE IMPORTANTE : Aucun service d'envoi d'email (Resend, SendGrid…) n'est
 * encore branché sur ce projet (voir PENDING dans la documentation du projet).
 * En attendant cette intégration, le code est affiché directement à l'écran
 * dans un encart clairement identifié comme "mode démonstration", ce qui
 * permet de tester l'intégralité du parcours de vérification.
 * Pour activer l'envoi réel, il suffira de remplacer la fonction
 * `sendVerificationCode` ci-dessous par un appel à l'API du fournisseur email
 * choisi (ex: Resend) sans changer le reste du flux.
 */

const STORAGE_KEY = "prolocal_review_verifications";
const CODE_TTL_MS = 10 * 60 * 1000;   // 10 minutes de validité
const RESEND_COOLDOWN_MS = 60 * 1000; // 60s avant de pouvoir renvoyer un code
const MAX_ATTEMPTS = 5;               // tentatives de saisie max avant blocage

interface PendingVerification {
  email: string;
  proId: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

function readStore(): Record<string, PendingVerification> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, PendingVerification>): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function keyFor(proId: string, email: string): string {
  return `${proId}::${email.trim().toLowerCase()}`;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendCodeResult {
  ok: boolean;
  /** Code affiché uniquement en mode démonstration (pas d'envoi email réel configuré). */
  demoCode?: string;
  /** Secondes restantes avant de pouvoir redemander un code. */
  cooldownRemaining?: number;
  error?: string;
}

/**
 * Génère et "envoie" un code de vérification à l'email fourni.
 * En l'absence de service email configuré, le code est retourné pour
 * affichage en mode démonstration — à remplacer par un vrai envoi (Resend, etc.)
 */
export function sendVerificationCode(proId: string, email: string): SendCodeResult {
  const store = readStore();
  const k = keyFor(proId, email);
  const existing = store[k];
  const now = Date.now();

  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      cooldownRemaining: Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000),
      error: "Veuillez patienter avant de redemander un code.",
    };
  }

  const code = generateCode();
  store[k] = {
    email: email.trim().toLowerCase(),
    proId,
    code,
    createdAt: now,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
  };
  writeStore(store);

  // TODO (production) : remplacer ce retour par un appel réel à l'API d'envoi d'email
  // (ex: Resend) transmettant `code` à `email`, et ne plus renvoyer `demoCode`.
  return { ok: true, demoCode: code };
}

export interface VerifyCodeResult {
  ok: boolean;
  error?: string;
}

/** Vérifie le code saisi par l'utilisateur pour un email et un professionnel donnés. */
export function verifyCode(proId: string, email: string, inputCode: string): VerifyCodeResult {
  const store = readStore();
  const k = keyFor(proId, email);
  const entry = store[k];

  if (!entry) {
    return { ok: false, error: "Aucun code n'a été envoyé pour cette adresse. Redemandez un code." };
  }
  if (Date.now() > entry.expiresAt) {
    delete store[k];
    writeStore(store);
    return { ok: false, error: "Ce code a expiré. Veuillez en redemander un." };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    delete store[k];
    writeStore(store);
    return { ok: false, error: "Trop de tentatives incorrectes. Veuillez redemander un code." };
  }
  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    writeStore(store);
    const remaining = MAX_ATTEMPTS - entry.attempts;
    return { ok: false, error: `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.` };
  }

  // Succès : on nettoie l'entrée pour empêcher toute réutilisation du code
  delete store[k];
  writeStore(store);
  return { ok: true };
}

/** Renvoie le temps restant (en secondes) avant de pouvoir redemander un code, ou 0. */
export function getResendCooldown(proId: string, email: string): number {
  const store = readStore();
  const entry = store[keyFor(proId, email)];
  if (!entry) return 0;
  const remaining = RESEND_COOLDOWN_MS - (Date.now() - entry.createdAt);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
