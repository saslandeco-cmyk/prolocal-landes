/**
 * Sauvegarde temporaire de l'état du formulaire d'inscription avant la
 * redirection vers Stripe Checkout (qui quitte la page et efface l'état
 * React en mémoire), et sa restauration au retour.
 */

const KEY = "prolocal_inscription_wizard_state";

export function saveWizardState(state: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Le state peut être volumineux (images en base64) ; on ignore
    // silencieusement un éventuel dépassement de quota sessionStorage.
  }
}

export function loadWizardState<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearWizardState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
