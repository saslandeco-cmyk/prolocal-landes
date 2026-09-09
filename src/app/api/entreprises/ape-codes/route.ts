import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getApeCodesSummary } from "@/lib/sirene/db";

/**
 * GET /api/entreprises/ape-codes
 *
 * Liste des codes APE présents en base avec leur libellé et le nombre
 * d'établissements actifs correspondants — sert à construire les filtres
 * "recherche par métier" côté interface, sans deviner les codes à l'avance.
 */
export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json({ codes: [] });
  }
  try {
    const codes = await getApeCodesSummary();
    return NextResponse.json({ codes });
  } catch (err: any) {
    console.error("[api/entreprises/ape-codes GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
