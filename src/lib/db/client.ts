import { neon } from "@neondatabase/serverless";

/**
 * Client de connexion à la base de données Postgres (Neon, l'intégration
 * Postgres native de Vercel — remplaçante du package @vercel/postgres,
 * désormais déprécié).
 *
 * ⚠️ ÉTAPE 1 de la migration vers une vraie base de données — voir la
 * stratégie SEO du site. Ce module est mis en place EN PARALLÈLE du
 * système actuel (localStorage), sans rien y toucher : les pages et le
 * tableau de bord continuent de fonctionner exactement comme avant tant
 * que les étapes suivantes (double-écriture, puis bascule des pages
 * publiques) n'ont pas été réalisées.
 *
 * La variable d'environnement POSTGRES_URL est injectée automatiquement
 * par Vercel si un projet Postgres (Neon) est relié au site (Vercel
 * Dashboard → Storage → Create Database). Aucune configuration manuelle
 * n'est nécessaire une fois la base créée sur Vercel.
 */
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export const isDbConfigured = Boolean(connectionString);

if (!isDbConfigured && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] POSTGRES_URL n'est pas définie. Les routes /api/db/* ne fonctionneront pas " +
    "tant qu'une base Postgres n'est pas reliée au projet sur Vercel (Storage → Create Database)."
  );
}

/**
 * Fonction "tagged template" pour exécuter des requêtes SQL, ex :
 *   const { rows } = await sql`SELECT * FROM professionals WHERE id = ${id}`;
 * Retourne un tableau de lignes directement (compatible avec l'usage
 * `{ rows }` déjà utilisé dans professionals.ts / reviews.ts).
 */
const rawSql = connectionString ? neon(connectionString) : null;

export async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!rawSql) {
    throw new Error("Base de données non configurée (POSTGRES_URL manquante).");
  }
  const rows = await rawSql(strings, ...values);
  return { rows: rows as any[] };
}
