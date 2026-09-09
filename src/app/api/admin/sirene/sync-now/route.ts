import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { runSync } from "@/lib/sirene/sync";

/**
 * POST /api/admin/sirene/sync-now
 *
 * Déclenchement manuel immédiat de la synchronisation depuis l'admin
 * (en plus du cron quotidien automatique — étape 2). Body optionnel
 * { codesApe: string[] } pour ne synchroniser que certains codes ;
 * sans body, synchronise tous les codes APE suivis.
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const codesApe: string[] | undefined = Array.isArray(body.codesApe) && body.codesApe.length > 0 ? body.codesApe : undefined;
    const stats = await runSync(codesApe);
    return NextResponse.json({ ok: true, ...stats });
  } catch (err: any) {
    console.error("[api/admin/sirene/sync-now] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la synchronisation." }, { status: 500 });
  }
}
