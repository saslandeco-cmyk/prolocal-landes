import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { dbDeleteReview } from "@/lib/db/reviews";

/** DELETE /api/db/reviews/[id] → supprime un avis */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { id } = await params;
    await dbDeleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/reviews/[id] DELETE] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la suppression de l'avis." }, { status: 500 });
  }
}
