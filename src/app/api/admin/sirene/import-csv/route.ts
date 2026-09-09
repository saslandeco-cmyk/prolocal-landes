import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { importEnrichmentCsv, type CsvImportRow } from "@/lib/sirene/db";

/**
 * POST /api/admin/sirene/import-csv
 * Body : { csv: string }
 *
 * Importe un fichier CSV d'enrichissement (téléphone/email/site web) pour
 * des établissements déjà présents en base — identifiés par SIRET. Colonnes
 * attendues (en-tête requis, ordre libre) : siret, telephone, email, site_web
 * (les colonnes manquantes sont ignorées).
 *
 * Ne crée jamais de nouvel établissement : voir la note dans
 * src/lib/sirene/db.ts (importEnrichmentCsv) sur ce choix volontaire.
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { csv } = await req.json();
    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "Contenu CSV manquant." }, { status: 400 });
    }

    const text = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: "Fichier CSV vide ou invalide (en-tête + au moins une ligne requis)." }, { status: 400 });
    }

    const sep = (lines[0].split(";").length >= lines[0].split(",").length) ? ";" : ",";
    const parseLine = (line: string) => line.split(sep).map(v => v.trim().replace(/^"|"$/g, ""));

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    const idxSiret = headers.findIndex(h => h === "siret");
    const idxTel = headers.findIndex(h => h === "telephone" || h === "téléphone");
    const idxEmail = headers.findIndex(h => h === "email");
    const idxSite = headers.findIndex(h => h === "site_web" || h === "site web" || h === "siteweb");

    if (idxSiret === -1) {
      return NextResponse.json({ error: "Colonne 'siret' obligatoire dans l'en-tête du CSV." }, { status: 400 });
    }

    const rows: CsvImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const siret = cols[idxSiret];
      if (!siret) continue;
      rows.push({
        siret,
        telephone: idxTel >= 0 ? cols[idxTel] || undefined : undefined,
        email: idxEmail >= 0 ? cols[idxEmail] || undefined : undefined,
        siteWeb: idxSite >= 0 ? cols[idxSite] || undefined : undefined,
      });
    }

    const result = await importEnrichmentCsv(rows);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("[api/admin/sirene/import-csv] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'import." }, { status: 500 });
  }
}
