import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add your Neon connection string to .env.local.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureSchema() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tracking_code TEXT UNIQUE NOT NULL,
      invoice_number TEXT NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      service TEXT,
      need TEXT,
      urgency TEXT,
      pack_name TEXT,
      amount TEXT,
      payment_status TEXT,
      pickup TEXT,
      destination TEXT,
      pickup_map_url TEXT,
      destination_map_url TEXT,
      package_type TEXT,
      notes TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS service TEXT,
    ADD COLUMN IF NOT EXISTS need TEXT,
    ADD COLUMN IF NOT EXISTS urgency TEXT,
    ADD COLUMN IF NOT EXISTS pickup_map_url TEXT,
    ADD COLUMN IF NOT EXISTS destination_map_url TEXT,
    ADD COLUMN IF NOT EXISTS package_type TEXT
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_events (
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
