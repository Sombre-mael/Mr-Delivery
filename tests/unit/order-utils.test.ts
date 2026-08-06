import { describe, expect, it } from "vitest";
import { createInvoiceNumber, createTrackingCode, maskCustomerName, maskLocation, normalizeTrackingCode } from "@/lib/order-utils";

describe("order identifiers", () => {
  it("creates long, distinct tracking codes", () => {
    const codes = new Set(Array.from({ length: 100 }, createTrackingCode));
    expect(codes.size).toBe(100);
    for (const code of codes) {
      expect(code).toMatch(/^MRD-[A-F0-9]{12}$/);
    }
  });

  it("creates dated invoice numbers", () => {
    expect(createInvoiceNumber()).toMatch(/^MRD-\d{8}-[A-F0-9]{6}$/);
  });

  it("accepts old and new tracking formats without accepting arbitrary text", () => {
    expect(normalizeTrackingCode("mrd-abc123")).toBe("MRD-ABC123");
    expect(normalizeTrackingCode("MRD-1234567890AB")).toBe("MRD-1234567890AB");
    expect(normalizeTrackingCode("../../operator")).toBe("");
  });
});

describe("public masking", () => {
  it("masks customer names", () => {
    expect(maskCustomerName("Marco Mael")).toBe("M•••• M•••");
  });

  it("does not expose complete addresses", () => {
    const masked = maskLocation("Avenue des Écoles Kampemba");
    expect(masked).not.toContain("Avenue");
    expect(masked).not.toContain("Kampemba");
  });
});
