import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { deleteEntreprise } from "@/lib/sirene/db";

/** DELETE /api/admin/sirene/delete/[siret] → supprime un établissement importé */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ siret: string }> }) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { siret } = await params;
    const ok = await deleteEntreprise(siret);
    if (!ok) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/admin/sirene/delete/[siret]] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la suppression." }, { status: 500 });
  }
}
