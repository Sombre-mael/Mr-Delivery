UPDATE neon_auth.project_config
SET email_and_password = jsonb_set(
      jsonb_set(COALESCE(email_and_password, '{}'::jsonb), '{enabled}', 'false'::jsonb, TRUE),
      '{disableSignUp}',
      'true'::jsonb,
      TRUE
    ),
    plugin_configs = jsonb_set(
      COALESCE(plugin_configs, '{}'::jsonb),
      '{magicLink,enabled}',
      'false'::jsonb,
      TRUE
    ),
    updated_at = NOW();
