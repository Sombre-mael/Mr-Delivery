import { randomUUID } from "crypto";
import { ensureSchema, getSql } from "@/lib/db";
import { createInvoiceNumber, createTrackingCode } from "@/lib/order-utils";
import { type DeliveryStatus } from "@/lib/whatsapp";

export type DeliveryOrder = {
  id: string;
  trackingCode: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  service: string;
  need: string;
  urgency: string;
  packName: string;
  amount: string;
  paymentStatus: string;
  pickup: string;
  destination: string;
  pickupMapUrl: string;
  destinationMapUrl: string;
  packageType: string;
  notes: string;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryOrderEvent = {
  id: number;
  orderId: string;
  status: DeliveryStatus;
  note: string;
  createdAt: string;
};

export type OrderInput = {
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  packName: string;
  service: string;
  need: string;
  urgency: string;
  amount: string;
  paymentStatus: string;
  pickup: string;
  destination: string;
  pickupMapUrl: string;
  destinationMapUrl: string;
  packageType: string;
  notes: string;
  status: DeliveryStatus;
};

function mapOrder(row: Record<string, unknown>): DeliveryOrder {
  return {
    id: String(row.id),
    trackingCode: String(row.tracking_code),
    invoiceNumber: String(row.invoice_number),
    customerName: String(row.customer_name || ""),
    customerPhone: String(row.customer_phone || ""),
    service: String(row.service || ""),
    need: String(row.need || ""),
    urgency: String(row.urgency || ""),
    packName: String(row.pack_name || ""),
    amount: String(row.amount || ""),
    paymentStatus: String(row.payment_status || ""),
    pickup: String(row.pickup || ""),
    destination: String(row.destination || ""),
    pickupMapUrl: String(row.pickup_map_url || ""),
    destinationMapUrl: String(row.destination_map_url || ""),
    packageType: String(row.package_type || ""),
    notes: String(row.notes || ""),
    status: String(row.status) as DeliveryStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapEvent(row: Record<string, unknown>): DeliveryOrderEvent {
  return {
    id: Number(row.id),
    orderId: String(row.order_id),
    status: String(row.status) as DeliveryStatus,
    note: String(row.note || ""),
    createdAt: String(row.created_at),
  };
}

export async function listOrders() {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders ORDER BY updated_at DESC`) as Record<string, unknown>[];
  return rows.map(mapOrder);
}

export async function getOrderByTrackingCode(trackingCode: string) {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders
    WHERE tracking_code = ${trackingCode.trim().toUpperCase()}
    LIMIT 1
  `) as Record<string, unknown>[];

  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getOrderEvents(orderId: string) {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM order_events
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `) as Record<string, unknown>[];

  return rows.map(mapEvent);
}

export async function createOrder(input: OrderInput) {
  await ensureSchema();
  const sql = getSql();
  const id = randomUUID();
  const trackingCode = createTrackingCode();
  const invoiceNumber = input.invoiceNumber || createInvoiceNumber();

  const rows = (await sql`
    INSERT INTO orders (
      id, tracking_code, invoice_number, customer_name, customer_phone,
      service, need, urgency, pack_name, amount, payment_status, pickup, destination,
      pickup_map_url, destination_map_url, package_type, notes, status
    )
    VALUES (
      ${id}, ${trackingCode}, ${invoiceNumber}, ${input.customerName}, ${input.customerPhone},
      ${input.service}, ${input.need}, ${input.urgency}, ${input.packName}, ${input.amount},
      ${input.paymentStatus}, ${input.pickup}, ${input.destination}, ${input.pickupMapUrl},
      ${input.destinationMapUrl}, ${input.packageType}, ${input.notes}, ${input.status}
    )
    RETURNING *
  `) as Record<string, unknown>[];

  await sql`
    INSERT INTO order_events (order_id, status, note)
    VALUES (${id}, ${input.status}, ${input.notes || "Commande creee"})
  `;

  return mapOrder(rows[0]);
}

export async function updateOrder(orderId: string, input: OrderInput) {
  await ensureSchema();
  const sql = getSql();

  const currentRows = (await sql`SELECT status FROM orders WHERE id = ${orderId} LIMIT 1`) as Record<string, unknown>[];
  const previousStatus = currentRows[0]?.status ? String(currentRows[0].status) : "";

  const rows = (await sql`
    UPDATE orders
    SET
      invoice_number = ${input.invoiceNumber},
      customer_name = ${input.customerName},
      customer_phone = ${input.customerPhone},
      service = ${input.service},
      need = ${input.need},
      urgency = ${input.urgency},
      pack_name = ${input.packName},
      amount = ${input.amount},
      payment_status = ${input.paymentStatus},
      pickup = ${input.pickup},
      destination = ${input.destination},
      pickup_map_url = ${input.pickupMapUrl},
      destination_map_url = ${input.destinationMapUrl},
      package_type = ${input.packageType},
      notes = ${input.notes},
      status = ${input.status},
      updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING *
  `) as Record<string, unknown>[];

  if (!rows[0]) {
    return null;
  }

  if (previousStatus !== input.status) {
    await sql`
      INSERT INTO order_events (order_id, status, note)
      VALUES (${orderId}, ${input.status}, ${input.notes || "Statut mis a jour"})
    `;
  }

  return mapOrder(rows[0]);
}
