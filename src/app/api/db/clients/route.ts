import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { dbGetClientsByPro, dbSaveClient } from "@/lib/db/clients";

/**
 * GET  /api/db/clients?proId=X → prospects/clients d'un professionnel
 * POST /api/db/clients         → crée ou met à jour un client (upsert)
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
    const clients = await dbGetClientsByPro(proId);
    return NextResponse.json({ clients });
  } catch (err: any) {
    console.error("[api/db/clients GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la lecture des clients." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const client = await req.json();
    if (!client?.id || !client?.proId) {
      return NextResponse.json({ error: "Objet Client invalide (id et proId requis)." }, { status: 400 });
    }
    await dbSaveClient(client);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/clients POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'enregistrement du client." }, { status: 500 });
  }
}
