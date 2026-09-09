import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getEntrepriseBySiret, getEntreprisesBySiren } from "@/lib/sirene/db";

/**
 * GET /api/entreprises/[siret]
 *
 * Détail d'un établissement, avec la liste des autres établissements
 * partageant le même SIREN (autres agences/sites de la même entreprise).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ siret: string }> }) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { siret } = await params;
    const entreprise = await getEntrepriseBySiret(siret);
    if (!entreprise) {
      return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
    }
    const autresEtablissements = (await getEntreprisesBySiren(entreprise.siren))
      .filter(e => e.siret !== siret);

    return NextResponse.json({ entreprise, autresEtablissements });
  } catch (err: any) {
    console.error("[api/entreprises/[siret] GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la lecture." }, { status: 500 });
  }
}
