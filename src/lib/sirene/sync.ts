import { fetchAllEtablissements } from "./client";
import {
  upsertEtablissement,
  logHistorique,
  getWatchedApeCodes,
  startSyncLog,
  finishSyncLog,
} from "./db";

export interface SyncStats {
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalUnchanged: number;
  codesApe: string[];
  durationMs: number;
}

/**
 * Synchronise l'intégralité des établissements actifs pour une liste de
 * codes APE dans le département 40 : pagination automatique complète,
 * dédoublonnage par upsert SIRET, et journalisation des changements réels
 * dans l'historique.
 *
 * Utilisée à la fois par le cron quotidien (/api/cron/sync-sirene) et par
 * un déclenchement manuel depuis l'admin (étape 4).
 */
export async function runSync(codesApe?: string[]): Promise<SyncStats> {
  const start = Date.now();

  // Si aucun code n'est passé explicitement, utilise la liste suivie
  // configurée depuis l'admin (table sirene_watched_ape_codes).
  const codes = codesApe && codesApe.length > 0
    ? codesApe
    : (await getWatchedApeCodes()).map(c => c.codeApe);

  if (codes.length === 0) {
    return { totalFetched: 0, totalInserted: 0, totalUpdated: 0, totalUnchanged: 0, codesApe: [], durationMs: Date.now() - start };
  }

  const logId = await startSyncLog(codes);
  let inserted = 0, updated = 0, unchanged = 0;

  try {
    // Un appel paginé par code APE, pour rester dans des lots raisonnables
    // et pouvoir identifier facilement quel code APE pose problème en cas
    // d'erreur partielle.
    for (const code of codes) {
      const etablissements = await fetchAllEtablissements([code], "40");

      for (const etab of etablissements) {
        const result = await upsertEtablissement(etab);
        if (result.status === "inserted") inserted++;
        else if (result.status === "updated") { updated++; await logHistorique(etab.siret, result.changes); }
        else unchanged++;
      }
    }

    const stats: SyncStats = {
      totalFetched: inserted + updated + unchanged,
      totalInserted: inserted,
      totalUpdated: updated,
      totalUnchanged: unchanged,
      codesApe: codes,
      durationMs: Date.now() - start,
    };

    await finishSyncLog(logId, {
      totalFetched: stats.totalFetched,
      totalInserted: inserted,
      totalUpdated: updated,
      totalUnchanged: unchanged,
    });

    return stats;
  } catch (err: any) {
    await finishSyncLog(logId, {
      totalFetched: inserted + updated + unchanged,
      totalInserted: inserted,
      totalUpdated: updated,
      totalUnchanged: unchanged,
      error: err.message || "Erreur inconnue lors de la synchronisation.",
    });
    throw err;
  }
}
