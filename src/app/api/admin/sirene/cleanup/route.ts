import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { cleanupOldSireneData, getSireneAuditCounts } from "@/lib/sirene/db";

/**
 * GET  /api/admin/sirene/cleanup → compteurs actuels (historique + journal)
 * POST /api/admin/sirene/cleanup → supprime les entrées plus anciennes que N jours
 * Body : { daysToKeep: number }
 *
 * Ne supprime jamais les entreprises elles-mêmes (entreprises_sirene) —
 * uniquement l'historique des modifications et le journal des
 * synchronisations, qui grossissent indéfiniment sans purge régulière.
 */
export async function GET() {
  if (!isDbConfigured) return NextResponse.json({ historique: 0, syncLogs: 0 });
  try {
    const counts = await getSireneAuditCounts();
    return NextResponse.json(counts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { daysToKeep } = await req.json();
    const days = Number(daysToKeep);
    if (!Number.isFinite(days) || days < 1) {
      return NextResponse.json({ error: "daysToKeep doit être un nombre entier positif (jours à conserver)." }, { status: 400 });
    }
    const result = await cleanupOldSireneData(days);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("[api/admin/sirene/cleanup] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors du nettoyage." }, { status: 500 });
  }
}
