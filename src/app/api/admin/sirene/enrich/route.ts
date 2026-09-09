import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { updateEnrichment } from "@/lib/sirene/db";

/**
 * POST /api/admin/sirene/enrich
 * Body : { siret: string, telephone?: string, email?: string, siteWeb?: string }
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { siret, telephone, email, siteWeb } = await req.json();
    if (!siret) return NextResponse.json({ error: "siret requis." }, { status: 400 });
    const ok = await updateEnrichment(siret, { telephone, email, siteWeb }, "manuel");
    if (!ok) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
