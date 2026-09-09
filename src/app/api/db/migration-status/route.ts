import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { dbGetMigrationSummary } from "@/lib/db/professionals";

/** GET /api/db/migration-status → nombre de fiches migrées vs total en base */
export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json({ configured: false, migrated: 0, total: 0 });
  }
  try {
    const summary = await dbGetMigrationSummary();
    return NextResponse.json({ configured: true, ...summary });
  } catch (err: any) {
    console.error("[api/db/migration-status GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
