import { describe, expect, it } from "vitest";
import { generateCustomOrderMessage, generateStatusMessage, generateWhatsAppLink } from "@/lib/whatsapp";

describe("WhatsApp messages", () => {
  it("encodes customer requests", () => {
    const message = generateCustomOrderMessage({ name: "Marco", pickup: "A", destination: "B" });
    const link = generateWhatsAppLink(message);
    expect(link).toContain("https://wa.me/243819428849?text=");
    expect(decodeURIComponent(link)).toContain("Marco");
  });

  it("uses only the explicitly public note in a status message", () => {
    const message = generateStatusMessage({ status: "in_delivery", notes: "Arrivée estimée à 14h" });
    expect(message).toContain("Arrivée estimée à 14h");
  });
});
