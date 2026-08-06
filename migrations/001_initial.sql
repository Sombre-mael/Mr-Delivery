CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service TEXT,
  need TEXT,
  urgency TEXT,
  pack_name TEXT,
  amount TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Paiement attendu',
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_map_url TEXT,
  destination_map_url TEXT,
  package_type TEXT,
  notes TEXT,
  internal_notes TEXT,
  public_note TEXT,
  status TEXT NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_events (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  public_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id, created_at);

CREATE TABLE IF NOT EXISTS operator_login_attempts (
  fingerprint TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
