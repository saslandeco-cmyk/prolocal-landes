import { sql, isDbConfigured } from "../db/client";
import type { SireneEtablissement } from "./client";

/**
 * Couche d'accès à la table entreprises_sirene. Le dédoublonnage est géré
 * nativement par la clé primaire SIRET (upsert via ON CONFLICT) — impossible
 * d'avoir deux lignes pour le même établissement.
 */

export interface EntrepriseRow {
  siret: string;
  siren: string;
  denomination: string | null;
  enseigne: string | null;
  codeApe: string | null;
  libelleApe: string | null;
  estSiege: boolean;
  etatAdministratif: string;
  adresse: string | null;
  codePostal: string | null;
  commune: string | null;
  departement: string;
  telephone: string | null;
  email: string | null;
  siteWeb: string | null;
  professionalId: string | null;
  updatedAt: string;
}

function rowToEntreprise(row: any): EntrepriseRow {
  return {
    siret: row.siret,
    siren: row.siren,
    denomination: row.denomination,
    enseigne: row.enseigne,
    codeApe: row.code_ape,
    libelleApe: row.libelle_ape,
    estSiege: row.est_siege,
    etatAdministratif: row.etat_administratif,
    adresse: row.adresse,
    codePostal: row.code_postal,
    commune: row.commune,
    departement: row.departement,
    telephone: row.telephone,
    email: row.email,
    siteWeb: row.site_web,
    professionalId: row.professional_id,
    updatedAt: row.updated_at,
  };
}

/**
 * Upsert d'un établissement. Retourne "inserted" | "updated" | "unchanged"
 * pour permettre le suivi statistique de la synchronisation (étape 2).
 *
 * Le dédoublonnage SIREN/SIRET est garanti par la contrainte PRIMARY KEY
 * sur `siret` : deux appels avec le même SIRET mettent systématiquement à
 * jour la même ligne, jamais de doublon possible.
 */
export async function upsertEtablissement(
  etab: SireneEtablissement
): Promise<"inserted" | "updated" | "unchanged"> {
  if (!isDbConfigured) return "unchanged";

  const { rows: existingRows } = await sql`
    SELECT denomination, code_ape, etat_administratif, adresse, code_postal, commune
    FROM entreprises_sirene WHERE siret = ${etab.siret}
  `;
  const existing = existingRows[0];

  const changed = existing && (
    existing.denomination !== etab.denomination ||
    existing.code_ape !== etab.codeApe ||
    existing.etat_administratif !== etab.etatAdministratif ||
    existing.adresse !== etab.adresse ||
    existing.code_postal !== etab.codePostal ||
    existing.commune !== etab.commune
  );

  await sql`
    INSERT INTO entreprises_sirene (
      siret, siren, nic, denomination, nom_commercial, enseigne,
      code_ape, libelle_ape, code_ape_naf2025, libelle_ape_naf2025,
      est_siege, etat_administratif, date_creation,
      adresse, code_postal, commune, code_commune_insee, departement,
      tranche_effectif, raw_data, source, last_synced_at, updated_at
    ) VALUES (
      ${etab.siret}, ${etab.siren}, ${etab.nic}, ${etab.denomination}, ${etab.nomCommercial}, ${etab.enseigne},
      ${etab.codeApe}, ${etab.libelleApe}, ${etab.codeApeNaf2025}, ${etab.libelleApeNaf2025},
      ${etab.estSiege}, ${etab.etatAdministratif}, ${etab.dateCreation},
      ${etab.adresse}, ${etab.codePostal}, ${etab.commune}, ${etab.codeCommuneInsee}, ${(etab.codePostal || "40").slice(0, 2)},
      ${etab.trancheEffectif}, ${JSON.stringify(etab.raw)}::jsonb, 'recherche-entreprises', now(), now()
    )
    ON CONFLICT (siret) DO UPDATE SET
      denomination = EXCLUDED.denomination,
      nom_commercial = EXCLUDED.nom_commercial,
      enseigne = EXCLUDED.enseigne,
      code_ape = EXCLUDED.code_ape,
      libelle_ape = EXCLUDED.libelle_ape,
      code_ape_naf2025 = EXCLUDED.code_ape_naf2025,
      libelle_ape_naf2025 = EXCLUDED.libelle_ape_naf2025,
      etat_administratif = EXCLUDED.etat_administratif,
      adresse = EXCLUDED.adresse,
      code_postal = EXCLUDED.code_postal,
      commune = EXCLUDED.commune,
      code_commune_insee = EXCLUDED.code_commune_insee,
      tranche_effectif = EXCLUDED.tranche_effectif,
      raw_data = EXCLUDED.raw_data,
      last_synced_at = now(),
      updated_at = now()
  `;

  if (!existing) return "inserted";
  return changed ? "updated" : "unchanged";
}

/** Enregistre les changements détectés dans l'historique (étape 2+). */
export async function logHistorique(
  siret: string,
  changes: { champ: string; ancienneValeur: string | null; nouvelleValeur: string | null }[]
): Promise<void> {
  if (!isDbConfigured || changes.length === 0) return;
  for (const c of changes) {
    await sql`
      INSERT INTO entreprises_sirene_historique (siret, champ, ancienne_valeur, nouvelle_valeur)
      VALUES (${siret}, ${c.champ}, ${c.ancienneValeur}, ${c.nouvelleValeur})
    `;
  }
}

export async function getEntreprisesCount(): Promise<number> {
  if (!isDbConfigured) return 0;
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM entreprises_sirene`;
  return rows[0]?.count || 0;
}

export async function getEntreprisesByApe(codeApe: string, limit = 50): Promise<EntrepriseRow[]> {
  if (!isDbConfigured) return [];
  const { rows } = await sql`
    SELECT * FROM entreprises_sirene
    WHERE code_ape = ${codeApe} AND etat_administratif = 'A'
    ORDER BY denomination ASC
    LIMIT ${limit}
  `;
  return rows.map(rowToEntreprise);
}
