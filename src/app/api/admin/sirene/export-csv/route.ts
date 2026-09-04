import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getAllEntreprisesForExport } from "@/lib/sirene/db";

/**
 * GET /api/admin/sirene/export-csv
 *
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

    const columns = [
      "SIRET", "SIREN", "Dénomination", "Enseigne", "Code APE", "Libellé APE",
      "Catégorie", "Sous-catégorie", "Adresse", "Code postal", "Commune",
      "Département", "Téléphone", "Email", "Site web", "Statut",
      "Dernière synchronisation",
    ];

    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = entreprises.map(e => [
      e.siret, e.siren, e.denomination, e.enseigne, e.codeApe, e.libelleApe,
      e.category ?? "", e.subcategory ?? "",
      e.adresse, e.codePostal, e.commune, e.departement,
      e.telephone, e.email, e.siteWeb,
      e.etatAdministratif === "A" ? "Actif" : e.etatAdministratif,
      new Date(e.updatedAt).toLocaleDateString("fr-FR"),
    ].map(escape).join(";"));

    const csv = [columns.map(escape).join(";"), ...rows].join("\n");
    const body = "\uFEFF" + csv; // BOM pour un affichage correct des accents dans Excel

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="entreprises-sirene-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[api/admin/sirene/export-csv] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'export." }, { status: 500 });
  }
}
