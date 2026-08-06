import { afterAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const run = testDatabaseUrl ? describe : describe.skip;
let createdId = "";

run("Neon order lifecycle", () => {
  it("creates, reads and updates a real test order", async () => {
    process.env.DATABASE_URL = testDatabaseUrl;
    const { createOrder, getOrderByTrackingCode, updateOrder } = await import("@/lib/orders");
    const order = await createOrder({
      customerName: "Client Integration",
      customerPhone: "+243819428849",
      invoiceNumber: "",
      packName: "Pack Pro",
      service: "Livraison",
      need: "Test",
      urgency: "Standard",
      amount: "7 500 FC",
      paymentStatus: "Paiement attendu",
      pickup: "Point A",
      destination: "Point B",
      pickupMapUrl: "",
      destinationMapUrl: "",
      packageType: "Petit colis",
      internalNotes: "Interne",
      publicNote: "Commande créée",
      status: "payment_pending",
    });
    createdId = order.id;

    expect((await getOrderByTrackingCode(order.trackingCode))?.id).toBe(order.id);
    const updated = await updateOrder(order.id, {
      ...order,
      paymentStatus: "Paiement confirmé",
      publicNote: "Paiement reçu",
      status: "payment_confirmed",
    });
    expect(updated?.status).toBe("payment_confirmed");
  });
});

afterAll(async () => {
  if (!testDatabaseUrl || !createdId) return;
  process.env.DATABASE_URL = testDatabaseUrl;
  const { getSql } = await import("@/lib/db");
  await getSql()`DELETE FROM orders WHERE id = ${createdId}`;
});
