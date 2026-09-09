import { sql, isDbConfigured } from "./client";
import type { Review } from "@/types";

/** Couche d'accès aux données — table `reviews`. Voir professionals.ts pour le contexte. */

function rowToReview(row: any): Review {
  return row.data as Review;
}

export async function dbGetReviewsByPro(proId: string): Promise<Review[]> {
  if (!isDbConfigured) return [];
  const { rows } = await sql`
    SELECT data FROM reviews WHERE pro_id = ${proId} ORDER BY created_at DESC
  `;
  return rows.map(rowToReview);
}

export async function dbSaveReview(review: Review): Promise<void> {
  if (!isDbConfigured) return;
  await sql`
    INSERT INTO reviews (id, pro_id, rating, verified, status, data, updated_at)
    VALUES (
      ${review.id}, ${review.proId}, ${review.rating},
      ${Boolean(review.verified)}, ${review.status},
      ${JSON.stringify(review)}::jsonb, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      rating = EXCLUDED.rating,
      verified = EXCLUDED.verified,
      status = EXCLUDED.status,
      data = EXCLUDED.data,
      updated_at = now()
  `;
}

export async function dbDeleteReview(id: string): Promise<void> {
  if (!isDbConfigured) return;
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}
