CREATE TABLE IF NOT EXISTS operator_members (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operator_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_events
  ADD COLUMN IF NOT EXISTS actor_email TEXT;

ALTER TABLE content_change_logs
  ADD COLUMN IF NOT EXISTS actor_email TEXT;

CREATE INDEX IF NOT EXISTS idx_operator_members_active ON operator_members(is_active, role);
CREATE INDEX IF NOT EXISTS idx_operator_activity_created_at ON operator_activity_logs(created_at DESC);

INSERT INTO operator_members (email, display_name, role, is_active)
VALUES ('mrdelivery004@gmail.com', 'Administration Mr. Delivery', 'admin', TRUE)
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = 'admin',
  is_active = TRUE,
  updated_at = NOW();
