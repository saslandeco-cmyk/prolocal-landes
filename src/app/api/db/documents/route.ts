import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { dbGetDocumentsByPro, dbSaveDocument } from "@/lib/db/billingDocuments";

/**
 * GET  /api/db/documents?proId=X → devis/factures/avoirs d'un professionnel
 * POST /api/db/documents         → crée ou met à jour un document (upsert)
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
    const documents = await dbGetDocumentsByPro(proId);
    return NextResponse.json({ documents });
  } catch (err: any) {
    console.error("[api/db/documents GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la lecture des documents." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const doc = await req.json();
    if (!doc?.id || !doc?.proId) {
      return NextResponse.json({ error: "Objet BillingDocument invalide (id et proId requis)." }, { status: 400 });
    }
    await dbSaveDocument(doc);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/documents POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'enregistrement du document." }, { status: 500 });
  }
}
