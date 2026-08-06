import { describe, expect, it } from "vitest";
import { normalizeCongolesePhone, validateOrderInput } from "@/lib/order-validation";
import type { OrderInput } from "@/lib/orders";

const validOrder: OrderInput = {
  customerName: "Client Test",
  customerPhone: "0819428849",
  invoiceNumber: "",
  packName: "Pack Pro",
  service: "Livraison",
  need: "Colis",
  urgency: "Standard",
  amount: "7 500 FC",
  paymentStatus: "Paiement attendu",
  pickup: "Golf Météo",
  destination: "Centre-ville",
  pickupMapUrl: "https://www.google.com/maps?q=-11.68,27.48",
  destinationMapUrl: "",
  packageType: "Petit colis",
  internalNotes: "Référence privée",
  publicNote: "Départ prévu à 14h",
  status: "payment_pending",
};

describe("order validation", () => {
  it("normalizes Congolese phone numbers", () => {
    expect(normalizeCongolesePhone("081 942 8849")).toBe("+243819428849");
  });

  it("requires payment before pickup", () => {
    expect(() => validateOrderInput({ ...validOrder, status: "picked_up" })).toThrow(/paiement/i);
  });

  it("rejects non-Google GPS links", () => {
    expect(() => validateOrderInput({ ...validOrder, pickupMapUrl: "https://example.com/location" })).toThrow(/Google Maps/i);
  });

  it("accepts a complete pending order", () => {
    expect(validateOrderInput(validOrder).customerPhone).toBe("+243819428849");
  });
});
