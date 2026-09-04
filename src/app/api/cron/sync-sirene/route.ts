import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { runSync } from "@/lib/sirene/sync";
import { cleanupOldSireneData } from "@/lib/sirene/db";

/**
 * GET /api/cron/sync-sirene
 *
 * Déclenché quotidiennement par Vercel Cron (voir vercel.json). Synchronise
 * tous les codes APE suivis (table sirene_watched_ape_codes, gérée depuis
 * l'admin — étape 4) pour le département 40, puis purge automatiquement
 * l'historique des modifications et le journal de synchronisation de plus
 * de 90 jours (ne supprime jamais les entreprises elles-mêmes — voir
 * /api/admin/sirene/cleanup pour un nettoyage manuel avec une autre durée).
 *
 * Protection : Vercel signe automatiquement les requêtes cron avec l'en-tête
 * `Authorization: Bearer ${CRON_SECRET}` — cette route vérifie ce jeton pour
 * empêcher un déclenchement externe non autorisé (qui consommerait le quota
 * de l'API Sirene inutilement). Voir .env.local.example pour CRON_SECRET.
 */
const AUDIT_RETENTION_DAYS = 90;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré côté serveur — synchronisation refusée par sécurité." },
      { status: 503 }
    );
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!isDbConfigured) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  try {
    const stats = await runSync();
    console.log(`[cron/sync-sirene] Terminé en ${stats.durationMs}ms — ${stats.totalInserted} créés, ${stats.totalUpdated} mis à jour, ${stats.totalUnchanged} inchangés (${stats.codesApe.length} code(s) APE).`);

    const cleanup = await cleanupOldSireneData(AUDIT_RETENTION_DAYS).catch(() => null);
    if (cleanup) {
      console.log(`[cron/sync-sirene] Nettoyage : ${cleanup.historiqueDeleted} entrées d'historique et ${cleanup.syncLogsDeleted} journaux supprimés (> ${AUDIT_RETENTION_DAYS}j).`);
    }

    return NextResponse.json({ ok: true, ...stats, cleanup });
  } catch (err: any) {
    console.error("[cron/sync-sirene] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la synchronisation." }, { status: 500 });
  }
}
