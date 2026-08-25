ALTER TABLE operator_members
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ;

UPDATE operator_members
SET must_change_password = TRUE
WHERE password_hash IS NULL;
