import { sql, isDbConfigured } from "./client";
import { OPTION_PRICES, type CheckoutItem } from "@/lib/pricing";

/**
 * Couche d'accès au catalogue des options complémentaires — gérable
 * (ajout/modification/suppression) depuis l'admin.
 *
 * Le catalogue codé en dur (OPTION_PRICES, src/lib/pricing.ts) sert de
 * valeurs par défaut / de secours : si la base n'est pas configurée, ou
 * que la table est vide (aucune modification admin n'a encore été faite),
 * le site utilise ce catalogue par défaut — le parcours de paiement ne
 * casse donc jamais, avant même la première configuration de la base.
 */

function rowToOption(row: any): CheckoutItem {
  return {
    id: row.id,
    name: row.name,
    unitAmount: row.unit_amount,
    cadence: row.cadence,
    description: row.description || undefined,
    stripeProductId: row.stripe_product_id,
  };
}

/** Retourne le catalogue des options : celui en base s'il existe, sinon le catalogue par défaut. */
export async function getEffectiveOptionPrices(): Promise<Record<string, CheckoutItem>> {
  if (!isDbConfigured) return OPTION_PRICES;
  try {
    const { rows } = await sql`SELECT * FROM complementary_options ORDER BY sort_order ASC`;
    if (rows.length === 0) return OPTION_PRICES;
    const map: Record<string, CheckoutItem> = {};
    for (const row of rows) map[row.id] = rowToOption(row);
    return map;
  } catch {
    return OPTION_PRICES;
  }
}

/** Options avec leur description (pour l'affichage admin/dashboard). */
export async function dbGetAllOptionsWithDescription(): Promise<
  (CheckoutItem & { description: string | null; sortOrder: number })[]
> {
  if (!isDbConfigured) return [];
  const { rows } = await sql`SELECT * FROM complementary_options ORDER BY sort_order ASC`;
  return rows.map(row => ({ ...rowToOption(row), description: row.description, sortOrder: row.sort_order }));
}

export async function dbSaveOption(opt: {
  id: string; name: string; description?: string; unitAmount: number;
  cadence: "month" | "once"; stripeProductId: string; sortOrder?: number;
}): Promise<void> {
  if (!isDbConfigured) return;
  await sql`
    INSERT INTO complementary_options (id, name, description, unit_amount, cadence, stripe_product_id, sort_order, updated_at)
    VALUES (
      ${opt.id}, ${opt.name}, ${opt.description || null}, ${opt.unitAmount},
      ${opt.cadence}, ${opt.stripeProductId}, ${opt.sortOrder ?? 0}, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      unit_amount = EXCLUDED.unit_amount,
      cadence = EXCLUDED.cadence,
      stripe_product_id = EXCLUDED.stripe_product_id,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
  `;
}

export async function dbDeleteOption(id: string): Promise<void> {
  if (!isDbConfigured) return;
  await sql`DELETE FROM complementary_options WHERE id = ${id}`;
}

/**
 * Amorce la table avec le catalogue par défaut si elle est vide — utile la
 * première fois que l'admin ouvre le panneau de gestion, pour repartir
 * d'une base cohérente avec ce qui est déjà proposé sur le site.
 */
export async function dbSeedOptionsIfEmpty(): Promise<void> {
  if (!isDbConfigured) return;
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM complementary_options`;
  if (rows[0]?.count > 0) return;
  let order = 0;
  for (const opt of Object.values(OPTION_PRICES)) {
    await dbSaveOption({ ...opt, sortOrder: order++ });
  }
}
