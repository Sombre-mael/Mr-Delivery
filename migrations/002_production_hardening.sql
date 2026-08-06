ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS public_note TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE orders
SET internal_notes = COALESCE(internal_notes, notes, '')
WHERE internal_notes IS NULL;

ALTER TABLE order_events
  ADD COLUMN IF NOT EXISTS public_note TEXT;

-- Existing event notes may contain internal information and remain private.
UPDATE order_events SET public_note = '' WHERE public_note IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_archived_at ON orders(archived_at);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id, created_at);

CREATE TABLE IF NOT EXISTS operator_login_attempts (
  fingerprint TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
