import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { getRecentSyncLogs } from "@/lib/sirene/db";

/** GET /api/admin/sirene/sync-log → historique des synchronisations récentes */
export async function GET() {
  if (!isDbConfigured) return NextResponse.json({ logs: [] });
  try {
    const logs = await getRecentSyncLogs(20);
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur." }, { status: 500 });
  }
}
