import { sql, isDbConfigured } from "./client";
import type { Client } from "@/types";

/** Couche d'accès aux données — table `clients` (CRM). Voir professionals.ts pour le contexte. */

function rowToClient(row: any): Client {
  return row.data as Client;
}

export async function dbGetClientsByPro(proId: string): Promise<Client[]> {
  if (!isDbConfigured) return [];
  const { rows } = await sql`
    SELECT data FROM clients WHERE pro_id = ${proId} ORDER BY updated_at DESC
  `;
  return rows.map(rowToClient);
}

export async function dbSaveClient(client: Client): Promise<void> {
  if (!isDbConfigured) return;
  await sql`
    INSERT INTO clients (id, pro_id, first_name, last_name, company, email, status, data, updated_at)
    VALUES (
      ${client.id}, ${client.proId}, ${client.firstName || null}, ${client.lastName || null},
      ${client.company || null}, ${client.email || null}, ${client.status},
      ${JSON.stringify(client)}::jsonb, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      company = EXCLUDED.company,
      email = EXCLUDED.email,
      status = EXCLUDED.status,
      data = EXCLUDED.data,
      updated_at = now()
  `;
}

export async function dbDeleteClient(id: string): Promise<void> {
  if (!isDbConfigured) return;
  await sql`DELETE FROM clients WHERE id = ${id}`;
}
