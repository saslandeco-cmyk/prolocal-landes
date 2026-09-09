/**
 * Réinitialisation de mot de passe par code email, pour les professionnels
 * qui ont oublié leurs identifiants de connexion au tableau de bord.
 *
 * Fonctionnement :
 * 1. Le professionnel saisit son email de connexion.
 * 2. Un code à 6 chiffres lui est envoyé par email (via /api/auth/send-reset-code).
 * 3. Il saisit ce code accompagné de son nouveau mot de passe.
 * 4. Une fois le code validé, le mot de passe est mis à jour directement
 *    dans la fiche professionnelle (stockage local du site).
 *
 * ⚠️ Comme le reste du site, l'envoi réel de l'email nécessite la variable
 * d'environnement RESEND_API_KEY. Sans cette clé, la route API répond en
 * "mode démonstration" et le code est affiché à l'écran pour permettre de
 * tester le parcours complet malgré tout.
 */

const STORAGE_KEY = "prolocal_password_reset";
const CODE_TTL_MS = 10 * 60 * 1000;   // 10 minutes de validité
const RESEND_COOLDOWN_MS = 60 * 1000; // 60s avant de pouvoir redemander un code
const MAX_ATTEMPTS = 5;

interface PendingReset {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

function readStore(): Record<string, PendingReset> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, PendingReset>): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendResetResult {
  ok: boolean;
  demo?: boolean;
  demoCode?: string;
  cooldownRemaining?: number;
  error?: string;
}

/** Génère un code de réinitialisation et l'envoie par email (ou mode démo). */
export async function sendResetCode(email: string, companyName: string): Promise<SendResetResult> {
  const store = readStore();
  const key = email.trim().toLowerCase();
  const existing = store[key];
  const now = Date.now();

  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      cooldownRemaining: Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000),
      error: "Veuillez patienter avant de redemander un code.",
    };
  }

  const code = generateCode();
  store[key] = { email: key, code, createdAt: now, expiresAt: now + CODE_TTL_MS, attempts: 0 };
  writeStore(store);

  try {
    const res = await fetch("/api/auth/send-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: key, code, companyName }),
    });
    const data = await res.json();
    if (data.error) return { ok: false, error: data.error };
    return { ok: true, demo: Boolean(data.demo), demoCode: data.demo ? code : undefined };
  } catch {
    return { ok: false, error: "Erreur réseau lors de l'envoi du code." };
  }
}

export interface VerifyResetResult {
  ok: boolean;
  error?: string;
}

/** Vérifie le code de réinitialisation saisi pour un email donné. */
export function verifyResetCode(email: string, inputCode: string): VerifyResetResult {
  const store = readStore();
  const key = email.trim().toLowerCase();
  const entry = store[key];

  if (!entry) {
    return { ok: false, error: "Aucun code n'a été envoyé pour cette adresse. Redemandez un code." };
  }
  if (Date.now() > entry.expiresAt) {
    delete store[key];
    writeStore(store);
    return { ok: false, error: "Ce code a expiré. Veuillez en redemander un." };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    delete store[key];
    writeStore(store);
    return { ok: false, error: "Trop de tentatives incorrectes. Veuillez redemander un code." };
  }
  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    writeStore(store);
    const remaining = MAX_ATTEMPTS - entry.attempts;
    return { ok: false, error: `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.` };
  }

  delete store[key];
  writeStore(store);
  return { ok: true };
}

export function getResetCooldown(email: string): number {
  const store = readStore();
  const entry = store[email.trim().toLowerCase()];
  if (!entry) return 0;
  const remaining = RESEND_COOLDOWN_MS - (Date.now() - entry.createdAt);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
