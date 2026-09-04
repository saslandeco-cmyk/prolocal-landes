import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { searchEtablissements } from "@/lib/sirene/client";
import { upsertEtablissement } from "@/lib/sirene/db";

/**
 * POST /api/admin/sirene/sync-test
 *
 * Synchronisation MANUELLE de preuve de concept (étape 1) — récupère une
 * seule page de résultats pour un ou plusieurs codes APE dans le
 * département 40, et les upsert en base. Sert à valider que la chaîne
 * complète fonctionne (API → parsing → dédoublonnage → PostgreSQL) avant
 * de mettre en place la synchronisation quotidienne automatique (étape 2)
 * et le dashboard admin (étape 4).
 *
 * Body attendu : { codesApe: string[], departement?: string }
 * Exemple : { "codesApe": ["43.21A"] } → électriciens du bâtiment
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json(
      { error: "Base de données non configurée (POSTGRES_URL manquante)." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const codesApe: string[] = Array.isArray(body.codesApe) ? body.codesApe : [];
    const departement: string = body.departement || "40";

    if (codesApe.length === 0) {
      return NextResponse.json(
        { error: "codesApe requis (ex: [\"43.21A\"] pour les électriciens)." },
        { status: 400 }
      );
    }

    const result = await searchEtablissements({ codesApe, departement, page: 1, perPage: 25 });

    let inserted = 0, updated = 0, unchanged = 0;
    for (const etab of result.etablissements) {
      const status = await upsertEtablissement(etab);
      if (status === "inserted") inserted++;
      else if (status === "updated") updated++;
      else unchanged++;
    }

    return NextResponse.json({
      ok: true,
      totalResultsApi: result.totalResults,
      totalPagesApi: result.totalPages,
      fetchedThisPage: result.etablissements.length,
      inserted,
      updated,
      unchanged,
      note: result.totalPages > 1
        ? `Cette route ne traite que la 1ère page (test). ${result.totalPages} pages au total pour ces critères — la synchronisation complète paginée arrivera à l'étape 2.`
        : "Toutes les pages ont été traitées (une seule page de résultats).",
      sample: result.etablissements.slice(0, 3).map(e => ({
        siret: e.siret, denomination: e.denomination, commune: e.commune, codeApe: e.codeApe,
      })),
    });
  } catch (err: any) {
    console.error("[api/admin/sirene/sync-test] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la synchronisation." }, { status: 500 });
  }
}
