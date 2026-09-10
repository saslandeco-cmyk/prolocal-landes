import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getAllEntreprisesForExport, getEntreprisesBySirets, type EntrepriseRow } from "@/lib/sirene/db";

const COLUMNS = [
  "SIRET", "SIREN", "Dénomination", "Enseigne", "Code APE", "Libellé APE",
  "Adresse", "Code postal", "Commune",
  "Département", "Latitude", "Longitude", "Téléphone", "Email", "Site web", "Statut",
  "Dernière synchronisation",
];

function escape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function buildCsv(entreprises: EntrepriseRow[]): string {
  const rows = entreprises.map(e => [
    e.siret, e.siren, e.denomination, e.enseigne, e.codeApe, e.libelleApe,
    e.adresse, e.codePostal, e.commune, e.departement,
    e.lat ?? "", e.lng ?? "",
    e.telephone, e.email, e.siteWeb,
    e.etatAdministratif === "A" ? "Actif" : e.etatAdministratif,
    new Date(e.updatedAt).toLocaleDateString("fr-FR"),
  ].map(escape).join(";"));

  const csv = [COLUMNS.map(escape).join(";"), ...rows].join("\n");
  return "\uFEFF" + csv; // BOM pour un affichage correct des accents dans Excel
}

function csvResponse(body: string, filenameSuffix: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="entreprises-sirene-${filenameSuffix}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

/**
 * GET /api/admin/sirene/export-csv
 * Exporte l'intégralité des entreprises actives importées via la
 * synchronisation SIRENE au format CSV (encodage UTF-8 avec BOM, séparateur
 * point-virgule, compatible Excel).
 */
export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const entreprises = await getAllEntreprisesForExport();
    return csvResponse(buildCsv(entreprises), "toutes");
  } catch (err: any) {
    console.error("[api/admin/sirene/export-csv] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'export." }, { status: 500 });
  }
}

/**
 * POST /api/admin/sirene/export-csv
 * Body : { sirets: string[] }
 * Exporte uniquement la sélection d'entreprises (identifiées par SIRET)
 * choisie par l'administrateur dans le panneau "Entreprises (SIRENE)".
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { sirets } = await req.json();
    if (!Array.isArray(sirets) || sirets.length === 0) {
      return NextResponse.json({ error: "sirets requis (tableau non vide)." }, { status: 400 });
    }
    const entreprises = await getEntreprisesBySirets(sirets);
    return csvResponse(buildCsv(entreprises), "selection");
  } catch (err: any) {
    console.error("[api/admin/sirene/export-csv POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'export de la sélection." }, { status: 500 });
  }
}
