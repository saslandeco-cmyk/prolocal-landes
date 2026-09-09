import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { dbGetReviewsByPro, dbSaveReview } from "@/lib/db/reviews";

/**
 * GET  /api/db/reviews?proId=X → avis d'un professionnel
 * POST /api/db/reviews         → crée ou met à jour un avis (upsert)
 */
export async function GET(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  const proId = req.nextUrl.searchParams.get("proId");
  if (!proId) {
    return NextResponse.json({ error: "Paramètre proId requis." }, { status: 400 });
  }
  try {
    const reviews = await dbGetReviewsByPro(proId);
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("[api/db/reviews GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la lecture des avis." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const review = await req.json();
    if (!review?.id || !review?.proId) {
      return NextResponse.json({ error: "Objet Review invalide (id et proId requis)." }, { status: 400 });
    }
    await dbSaveReview(review);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/reviews POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'enregistrement de l'avis." }, { status: 500 });
  }
}
