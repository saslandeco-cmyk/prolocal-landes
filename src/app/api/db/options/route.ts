import { NextRequest, NextResponse } from "next/server";
import { getEffectiveOptionPrices, dbSaveOption, dbSeedOptionsIfEmpty, dbGetAllOptionsWithDescription } from "@/lib/db/options";

/**
 * GET  /api/db/options            → catalogue effectif (base si dispo, sinon valeurs par défaut)
 * GET  /api/db/options?admin=1    → catalogue complet avec description, pour le panneau admin
 * POST /api/db/options            → crée ou met à jour une option (upsert)
 */
export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get("admin") === "1") {
      await dbSeedOptionsIfEmpty();
      const options = await dbGetAllOptionsWithDescription();
      return NextResponse.json({ options });
    }
    const options = await getEffectiveOptionPrices();
    return NextResponse.json({ options });
  } catch (err: any) {
    console.error("[api/db/options GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la lecture des options." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.id || !body?.name || typeof body.unitAmount !== "number" || !body?.cadence) {
      return NextResponse.json({ error: "Champs requis manquants (id, name, unitAmount, cadence)." }, { status: 400 });
    }
    await dbSaveOption({
      id: body.id,
      name: body.name,
      description: body.description || "",
      unitAmount: body.unitAmount,
      cadence: body.cadence,
      stripeProductId: body.stripeProductId || `prolocal_opt_${body.id}`,
      sortOrder: body.sortOrder ?? 0,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/db/options POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'enregistrement de l'option." }, { status: 500 });
  }
}
