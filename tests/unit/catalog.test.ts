import { describe, expect, it } from "vitest";
import { validateBusinessSettings, validatePackUpdate, validateServiceUpdate } from "@/lib/catalog";

describe("catalog validation", () => {
  it("normalizes editable business contact details", () => {
    expect(
      validateBusinessSettings({
        whatsappNumber: "+243 819 428 849",
        callPhoneNumber: "+243 819 428 849",
        displayPhoneNumber: "+243 819 428 849",
        emailAddress: " MRDELIVERY004@GMAIL.COM ",
        locationLabel: "Lubumbashi, RDC",
        businessHours: "Disponible 7j/7 dès 7h00",
      }),
    ).toMatchObject({
      whatsappNumber: "243819428849",
      callPhoneNumber: "243819428849",
      emailAddress: "mrdelivery004@gmail.com",
    });
  });

  it("removes empty pack benefits", () => {
    const pack = validatePackUpdate({
      id: "pack-flash",
      name: "Pack Flash",
      idealFor: "Restaurants",
      price: "Dès 7 500 FC",
      delay: "30-50 min",
      benefits: ["Rapide", "", "  Suivi  "],
      popular: false,
      quote: false,
      isActive: true,
      sortOrder: 10,
    });

    expect(pack.benefits).toEqual(["Rapide", "Suivi"]);
  });

  it("rejects an unsupported service icon", () => {
    expect(() =>
      validateServiceUpdate({
        id: "express",
        title: "Express",
        description: "Livraison rapide",
        icon: "invalid" as "zap",
        isActive: true,
        sortOrder: 10,
      }),
    ).toThrow("Icône de service invalide");
  });
});
