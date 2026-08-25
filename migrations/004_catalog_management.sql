CREATE TABLE IF NOT EXISTS catalog_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ideal_for TEXT NOT NULL,
  price TEXT NOT NULL,
  delay TEXT NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_quote BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_settings (
  id TEXT PRIMARY KEY CHECK (id = 'main'),
  whatsapp_number TEXT NOT NULL,
  call_phone_number TEXT NOT NULL,
  display_phone_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  location_label TEXT NOT NULL,
  business_hours TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_change_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_packs_order ON catalog_packs(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_services_order ON catalog_services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_change_logs_created_at ON content_change_logs(created_at DESC);

INSERT INTO catalog_packs (id, name, ideal_for, price, delay, benefits, is_popular, is_quote, is_active, sort_order)
VALUES
  ('pack-flash', 'Pack Flash', 'restaurants et repas', 'Dès 7 500 FC', '30-50 min', '["Livraison ultra-rapide", "Idéal repas chauds", "Confirmation photo", "Support WhatsApp"]'::jsonb, FALSE, FALSE, TRUE, 10),
  ('pack-pro', 'Pack Pro', 'e-commerce et boutiques', 'Dès 6 500 FC', '1-3h', '["Petits colis e-commerce", "Suivi de livraison", "Accusé de réception", "Photo de confirmation", "Support WhatsApp prioritaire"]'::jsonb, TRUE, FALSE, TRUE, 20),
  ('pack-sante', 'Pack Santé', 'pharmacies et laboratoires', 'Dès 7 000 FC', '30-60 min', '["Médicaments et documents", "Prise en charge urgente", "Livraison sécurisée", "Support WhatsApp"]'::jsonb, FALSE, FALSE, TRUE, 30),
  ('pack-cargo', 'Pack Cargo', 'colis lourds de 5 à 20 kg', 'Devis sur demande', 'Sur devis', '["Colis jusqu''à 20 kg", "Marchandises volumineuses", "Coordination personnalisée", "Suivi GPS"]'::jsonb, FALSE, TRUE, TRUE, 40),
  ('pack-inter-70km', 'Pack Inter 70KM', 'Kipushi, Likasi, Kasumbalesa', 'Tarif selon destination', 'Délai selon destination', '["Livraison interurbaine", "Planning coordonné", "Devis rapide", "Support WhatsApp"]'::jsonb, FALSE, TRUE, TRUE, 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalog_services (id, title, description, icon, is_active, sort_order)
VALUES
  ('livraison-express', 'Livraison Express', 'Délai réduit pour urgences, repas, documents et petits colis.', 'zap', TRUE, 10),
  ('livraison-standard', 'Livraison Standard', 'Envois fiables dans un délai souple pour vos besoins quotidiens.', 'package', TRUE, 20),
  ('documents-courrier', 'Documents & Courrier', 'Envoi sécurisé de factures, contrats, courriers et documents administratifs.', 'fileText', TRUE, 30),
  ('mode-textiles', 'Mode & Textiles', 'Livraison pour boutiques, stylistes, vêtements, chaussures, sacs et accessoires.', 'shirt', TRUE, 40),
  ('bijouterie-horlogerie', 'Bijouterie & Horlogerie', 'Service renforcé pour bijoux, montres et objets de valeur.', 'gem', TRUE, 50),
  ('cadeaux-speciaux', 'Cadeaux & Spéciaux', 'Prise en charge de cadeaux, surprises et colis personnalisés.', 'gift', TRUE, 60),
  ('livraison-sante', 'Livraison Santé', 'Pharmacies, laboratoires, médicaments et documents médicaux urgents.', 'heartPulse', TRUE, 70),
  ('cargo-interurbain', 'Cargo & Interurbain', 'Colis de 5 à 20 kg et trajets vers Kipushi, Likasi ou Kasumbalesa.', 'truck', TRUE, 80)
ON CONFLICT (id) DO NOTHING;

INSERT INTO business_settings (
  id, whatsapp_number, call_phone_number, display_phone_number, email_address, location_label, business_hours
)
VALUES (
  'main', '243819428849', '243819428849', '+243 819 428 849', 'mrdelivery004@gmail.com', 'Lubumbashi, RDC', 'Disponible 7j/7 dès 7h00'
)
ON CONFLICT (id) DO NOTHING;
