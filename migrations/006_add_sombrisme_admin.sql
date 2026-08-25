INSERT INTO operator_members (email, display_name, role, is_active)
VALUES ('sombrisme@gmail.com', 'Administration Mr. Delivery', 'admin', TRUE)
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = 'admin',
  is_active = TRUE,
  updated_at = NOW();
