import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { removeWatchedApeCode } from "@/lib/sirene/db";

/** DELETE /api/admin/sirene/watched-codes/[code] → retire un code APE suivi */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée (POSTGRES_URL manquante)." }, { status: 503 });
  }
  try {
    const { code } = await params;
    await removeWatchedApeCode(decodeURIComponent(code));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
