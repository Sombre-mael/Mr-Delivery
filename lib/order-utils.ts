import { randomBytes } from "crypto";

export function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `MRD-${date}-${random}`;
}

export function createTrackingCode() {
  return `MRD-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export function normalizeTrackingCode(value: string) {
  const code = value.trim().toUpperCase().slice(0, 32);
  return /^MRD-[A-Z0-9]{6,16}$/.test(code) ? code : "";
}

export function maskCustomerName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${"•".repeat(Math.max(2, Math.min(part.length - 1, 5)))}`)
    .join(" ");
}

export function maskLocation(value: string) {
  if (!value.trim()) {
    return "À confirmer";
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 3) {
        return part;
      }

      return `${part.slice(0, 3)}${"•".repeat(Math.min(part.length - 3, 6))}`;
    })
    .join(" ");
}
