import { getSql } from "@/lib/db";
import {
  defaultBusinessSettings,
  packs as defaultPacks,
  services as defaultServices,
  type BusinessSettings,
  type IconName,
  type Pack,
  type Service,
} from "@/lib/data";

export type ContentChangeLog = {
  id: number;
  entityType: "pack" | "service" | "settings";
  entityId: string;
  action: string;
  summary: string;
  createdAt: string;
};

export type CatalogData = {
  packs: Pack[];
  services: Service[];
  settings: BusinessSettings;
  logs: ContentChangeLog[];
  usingFallback: boolean;
};

export type PackUpdateInput = {
  id: string;
  name: string;
  idealFor: string;
  price: string;
  delay: string;
  benefits: string[];
  popular: boolean;
  quote: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type ServiceUpdateInput = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  isActive: boolean;
  sortOrder: number;
};

const allowedIcons: IconName[] = [
  "zap",
  "package",
  "fileText",
  "shirt",
  "gem",
  "gift",
  "heartPulse",
  "truck",
  "message",
  "userCheck",
  "badgeCheck",
  "mapPin",
];

function fallbackPacks() {
  return defaultPacks.map((pack, index) => ({
    ...pack,
    isActive: true,
    sortOrder: (index + 1) * 10,
  }));
}

function fallbackServices() {
  return defaultServices.map((service, index) => ({
    ...service,
    isActive: true,
    sortOrder: (index + 1) * 10,
  }));
}

function mapPack(row: Record<string, unknown>): Pack {
  const rawBenefits = row.benefits;
  const benefits = Array.isArray(rawBenefits)
    ? rawBenefits.map(String)
    : typeof rawBenefits === "string"
      ? JSON.parse(rawBenefits).map(String)
      : [];

  return {
    id: String(row.id),
    name: String(row.name || ""),
    idealFor: String(row.ideal_for || ""),
    price: String(row.price || ""),
    delay: String(row.delay || ""),
    benefits,
    popular: Boolean(row.is_popular),
    quote: Boolean(row.is_quote),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
  };
}

function mapService(row: Record<string, unknown>): Service {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    icon: String(row.icon || "package") as IconName,
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
  };
}

function mapSettings(row?: Record<string, unknown>): BusinessSettings {
  if (!row) return defaultBusinessSettings;

  return {
    whatsappNumber: String(row.whatsapp_number || defaultBusinessSettings.whatsappNumber),
    callPhoneNumber: String(row.call_phone_number || defaultBusinessSettings.callPhoneNumber),
    displayPhoneNumber: String(row.display_phone_number || defaultBusinessSettings.displayPhoneNumber),
    emailAddress: String(row.email_address || defaultBusinessSettings.emailAddress),
    locationLabel: String(row.location_label || defaultBusinessSettings.locationLabel),
    businessHours: String(row.business_hours || defaultBusinessSettings.businessHours),
  };
}

function mapLog(row: Record<string, unknown>): ContentChangeLog {
  return {
    id: Number(row.id),
    entityType: String(row.entity_type) as ContentChangeLog["entityType"],
    entityId: String(row.entity_id),
    action: String(row.action),
    summary: String(row.summary),
    createdAt: String(row.created_at),
  };
}

export async function getCatalogData(options: { includeInactive?: boolean; includeLogs?: boolean } = {}): Promise<CatalogData> {
  try {
    const sql = getSql();
    const [packRows, serviceRows, settingsRows, logRows] = await Promise.all([
      sql`SELECT * FROM catalog_packs ORDER BY sort_order ASC, name ASC`,
      sql`SELECT * FROM catalog_services ORDER BY sort_order ASC, title ASC`,
      sql`SELECT * FROM business_settings WHERE id = 'main' LIMIT 1`,
      options.includeLogs
        ? sql`SELECT * FROM content_change_logs ORDER BY created_at DESC LIMIT 30`
        : Promise.resolve([]),
    ]);

    const packs = (packRows as Record<string, unknown>[]).map(mapPack);
    const services = (serviceRows as Record<string, unknown>[]).map(mapService);

    return {
      packs: options.includeInactive ? packs : packs.filter((pack) => pack.isActive),
      services: options.includeInactive ? services : services.filter((service) => service.isActive),
      settings: mapSettings((settingsRows as Record<string, unknown>[])[0]),
      logs: (logRows as Record<string, unknown>[]).map(mapLog),
      usingFallback: false,
    };
  } catch (error) {
    console.error("Catalog data unavailable, using local defaults", error);
    return {
      packs: fallbackPacks(),
      services: fallbackServices(),
      settings: defaultBusinessSettings,
      logs: [],
      usingFallback: true,
    };
  }
}

function requireText(value: string, label: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} est obligatoire.`);
  if (normalized.length > maxLength) throw new Error(`${label} est trop long.`);
  return normalized;
}

function requireOrder(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 9999) {
    throw new Error("L’ordre d’affichage doit être compris entre 0 et 9999.");
  }
  return value;
}

export function validatePackUpdate(input: PackUpdateInput): PackUpdateInput {
  const benefits = input.benefits.map((item) => item.trim()).filter(Boolean).slice(0, 8);
  if (!benefits.length) throw new Error("Ajoutez au moins un avantage au pack.");

  return {
    ...input,
    id: requireText(input.id, "Identifiant", 80),
    name: requireText(input.name, "Nom du pack", 80),
    idealFor: requireText(input.idealFor, "Public concerné", 140),
    price: requireText(input.price, "Prix", 80),
    delay: requireText(input.delay, "Délai", 80),
    benefits: benefits.map((benefit) => requireText(benefit, "Avantage", 140)),
    sortOrder: requireOrder(input.sortOrder),
  };
}

export function validateServiceUpdate(input: ServiceUpdateInput): ServiceUpdateInput {
  if (!allowedIcons.includes(input.icon)) throw new Error("Icône de service invalide.");

  return {
    ...input,
    id: requireText(input.id, "Identifiant", 80),
    title: requireText(input.title, "Nom du service", 100),
    description: requireText(input.description, "Description", 320),
    sortOrder: requireOrder(input.sortOrder),
  };
}

export function validateBusinessSettings(input: BusinessSettings): BusinessSettings {
  const whatsappNumber = requireText(input.whatsappNumber, "Numéro WhatsApp", 20).replace(/\D/g, "");
  const callPhoneNumber = requireText(input.callPhoneNumber, "Numéro d’appel", 20).replace(/\D/g, "");
  const emailAddress = requireText(input.emailAddress, "Adresse email", 160).toLowerCase();

  if (whatsappNumber.length < 10 || callPhoneNumber.length < 10) throw new Error("Le numéro de téléphone est invalide.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) throw new Error("L’adresse email est invalide.");

  return {
    whatsappNumber,
    callPhoneNumber,
    displayPhoneNumber: requireText(input.displayPhoneNumber, "Téléphone affiché", 40),
    emailAddress,
    locationLabel: requireText(input.locationLabel, "Zone principale", 120),
    businessHours: requireText(input.businessHours, "Horaires", 160),
  };
}

export async function updateCatalogPack(input: PackUpdateInput) {
  const pack = validatePackUpdate(input);
  const sql = getSql();
  await sql.transaction((tx) => [
    tx`
      UPDATE catalog_packs SET
        name = ${pack.name}, ideal_for = ${pack.idealFor}, price = ${pack.price}, delay = ${pack.delay},
        benefits = ${JSON.stringify(pack.benefits)}::jsonb, is_popular = ${pack.popular}, is_quote = ${pack.quote},
        is_active = ${pack.isActive}, sort_order = ${pack.sortOrder}, updated_at = NOW()
      WHERE id = ${pack.id}
    `,
    tx`
      INSERT INTO content_change_logs (entity_type, entity_id, action, summary)
      VALUES ('pack', ${pack.id}, 'updated', ${`${pack.name} : ${pack.price}`})
    `,
  ]);
}

export async function updateCatalogService(input: ServiceUpdateInput) {
  const service = validateServiceUpdate(input);
  const sql = getSql();
  await sql.transaction((tx) => [
    tx`
      UPDATE catalog_services SET
        title = ${service.title}, description = ${service.description}, icon = ${service.icon},
        is_active = ${service.isActive}, sort_order = ${service.sortOrder}, updated_at = NOW()
      WHERE id = ${service.id}
    `,
    tx`
      INSERT INTO content_change_logs (entity_type, entity_id, action, summary)
      VALUES ('service', ${service.id}, 'updated', ${service.title})
    `,
  ]);
}

export async function updateBusinessSettings(input: BusinessSettings) {
  const settings = validateBusinessSettings(input);
  const sql = getSql();
  await sql.transaction((tx) => [
    tx`
      UPDATE business_settings SET
        whatsapp_number = ${settings.whatsappNumber}, call_phone_number = ${settings.callPhoneNumber},
        display_phone_number = ${settings.displayPhoneNumber}, email_address = ${settings.emailAddress},
        location_label = ${settings.locationLabel}, business_hours = ${settings.businessHours}, updated_at = NOW()
      WHERE id = 'main'
    `,
    tx`
      INSERT INTO content_change_logs (entity_type, entity_id, action, summary)
      VALUES ('settings', 'main', 'updated', 'Coordonnées et horaires mis à jour')
    `,
  ]);
}
