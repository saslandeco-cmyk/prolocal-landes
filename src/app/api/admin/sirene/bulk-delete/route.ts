import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { deleteEntreprises } from "@/lib/sirene/db";

/**
 * POST /api/admin/sirene/bulk-delete
 * Body : { sirets: string[] }
 * Supprime en masse les établissements sélectionnés dans l'admin.
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
    const deleted = await deleteEntreprises(sirets);
    return NextResponse.json({ ok: true, deleted });
  } catch (err: any) {
    console.error("[api/admin/sirene/bulk-delete] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la suppression en masse." }, { status: 500 });
  }
}
