import { NextRequest, NextResponse } from "next/server";
import { dbDeleteOption } from "@/lib/db/options";

/** DELETE /api/db/options/[id] → supprime une option du catalogue */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbDeleteOption(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/options/[id] DELETE] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la suppression de l'option." }, { status: 500 });
  }
}
