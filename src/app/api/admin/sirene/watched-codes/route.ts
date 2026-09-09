import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getWatchedApeCodes, addWatchedApeCode } from "@/lib/sirene/db";

/**
 * GET  /api/admin/sirene/watched-codes  → liste des codes APE suivis (synchronisés par le cron)
 * POST /api/admin/sirene/watched-codes  → ajoute un code APE à suivre
 */
export async function GET() {
  if (!isDbConfigured) return NextResponse.json({ codes: [] });
  try {
    const codes = await getWatchedApeCodes();
    return NextResponse.json({ codes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { codeApe, libelle } = await req.json();
    if (!codeApe) return NextResponse.json({ error: "codeApe requis." }, { status: 400 });
    await addWatchedApeCode(codeApe.trim().toUpperCase(), libelle);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
