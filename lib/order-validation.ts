import type { OrderInput } from "@/lib/orders";
import type { DeliveryStatus } from "@/lib/whatsapp";

const DELIVERY_STATUSES = new Set<DeliveryStatus>([
  "payment_pending",
  "payment_confirmed",
  "picked_up",
  "in_delivery",
  "delivered",
  "issue",
]);
const PAYMENT_STATUSES = new Set(["Paiement attendu", "Paiement confirmé", "Devis à confirmer"]);
const GOOGLE_MAPS_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl"]);

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

function clean(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function normalizeCongolesePhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = `243${digits.slice(1)}`;
  } else if (!digits.startsWith("243") && digits.length === 9) {
    digits = `243${digits}`;
  }

  if (!/^243\d{9}$/.test(digits)) {
    throw new OrderValidationError("Le numéro client doit être un numéro congolais valide.");
  }

  return `+${digits}`;
}

function validateMapsUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase())) {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new OrderValidationError("Les liens GPS doivent être des liens Google Maps sécurisés.");
  }
}

export function validateOrderInput(input: OrderInput): OrderInput {
  const customerName = clean(input.customerName, 100);
  const pickup = clean(input.pickup, 240);
  const destination = clean(input.destination, 240);
  const paymentStatus = clean(input.paymentStatus, 40);
  const amount = clean(input.amount, 40);

  if (!customerName || !pickup || !destination) {
    throw new OrderValidationError("Le nom, le ramassage et la destination sont obligatoires.");
  }

  if (!DELIVERY_STATUSES.has(input.status)) {
    throw new OrderValidationError("Le statut de livraison est invalide.");
  }

  if (!PAYMENT_STATUSES.has(paymentStatus)) {
    throw new OrderValidationError("Le statut de paiement est invalide.");
  }

  if (amount && !/^(?:devis|[\d\s.,]+\s*(?:fc|cdf|usd|\$)?)$/i.test(amount)) {
    throw new OrderValidationError("Le montant doit être un prix ou la mention Devis.");
  }

  if (["picked_up", "in_delivery", "delivered"].includes(input.status) && paymentStatus !== "Paiement confirmé") {
    throw new OrderValidationError("Le paiement doit être confirmé avant la prise en charge du colis.");
  }

  return {
    ...input,
    customerName,
    customerPhone: normalizeCongolesePhone(input.customerPhone),
    invoiceNumber: clean(input.invoiceNumber, 60),
    packName: clean(input.packName, 80),
    service: clean(input.service, 100),
    need: clean(input.need, 160),
    urgency: clean(input.urgency, 80),
    amount,
    paymentStatus,
    pickup,
    destination,
    pickupMapUrl: validateMapsUrl(input.pickupMapUrl.trim()),
    destinationMapUrl: validateMapsUrl(input.destinationMapUrl.trim()),
    packageType: clean(input.packageType, 100),
    internalNotes: clean(input.internalNotes, 1000),
    publicNote: clean(input.publicNote, 500),
  };
}
