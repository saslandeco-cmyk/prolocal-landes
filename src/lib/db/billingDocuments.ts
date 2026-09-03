import { sql, isDbConfigured } from "./client";
import type { BillingDocument } from "@/types";

/** Couche d'accès aux données — table `billing_documents` (devis/factures/avoirs). */

function rowToDocument(row: any): BillingDocument {
  return row.data as BillingDocument;
}

export async function dbGetDocumentsByPro(proId: string): Promise<BillingDocument[]> {
  if (!isDbConfigured) return [];
  const { rows } = await sql`
    SELECT data FROM billing_documents WHERE pro_id = ${proId} ORDER BY updated_at DESC
  `;
  return rows.map(rowToDocument);
}

export async function dbSaveDocument(doc: BillingDocument): Promise<void> {
  if (!isDbConfigured) return;
  await sql`
    INSERT INTO billing_documents (id, pro_id, type, status, number, issue_date, data, updated_at)
    VALUES (
      ${doc.id}, ${doc.proId}, ${doc.type}, ${doc.status},
      ${doc.number || null}, ${doc.issueDate || null},
      ${JSON.stringify(doc)}::jsonb, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      type = EXCLUDED.type,
      status = EXCLUDED.status,
      number = EXCLUDED.number,
      issue_date = EXCLUDED.issue_date,
      data = EXCLUDED.data,
      updated_at = now()
  `;
}

export async function dbDeleteDocument(id: string): Promise<void> {
  if (!isDbConfigured) return;
  await sql`DELETE FROM billing_documents WHERE id = ${id}`;
}
