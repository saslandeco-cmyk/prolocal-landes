// Luhn algorithm for SIREN validation
export function validateSiren(siren: string): boolean {
  const cleaned = siren.replace(/\s/g, "");
  if (cleaned.length !== 9 || !/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function formatSiren(siren: string): string {
  const cleaned = siren.replace(/\s/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

// Mock SIREN API lookup
export async function lookupSiren(siren: string): Promise<SirenData | null> {
  await new Promise((r) => setTimeout(r, 800)); // Simulate API call
  
  const cleaned = siren.replace(/\s/g, "");
  if (!validateSiren(cleaned)) return null;
  
  // Mock response - in production, call api.insee.fr/entreprises/sirene
  return {
    siren: cleaned,
    denomination: null,
    formeJuridique: null,
    etatAdministratif: "A", // A = active
    valid: true,
  };
}

export interface SirenData {
  siren: string;
  denomination: string | null;
  formeJuridique: string | null;
  etatAdministratif: string;
  valid: boolean;
}
