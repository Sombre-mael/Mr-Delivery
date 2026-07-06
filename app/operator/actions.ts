"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOperatorSession, destroyOperatorSession, isOperatorAuthenticated, verifyAdminPassword } from "@/lib/operator-auth";
import { createOrder, updateOrder, type OrderInput } from "@/lib/orders";
import { type DeliveryStatus } from "@/lib/whatsapp";

const validStatuses: DeliveryStatus[] = [
  "payment_pending",
  "payment_confirmed",
  "picked_up",
  "in_delivery",
  "delivered",
  "issue",
];

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readStatus(formData: FormData) {
  const status = readText(formData, "status") as DeliveryStatus;
  return validStatuses.includes(status) ? status : "payment_pending";
}

function readOrderInput(formData: FormData): OrderInput {
  return {
    customerName: readText(formData, "customerName"),
    customerPhone: readText(formData, "customerPhone"),
    invoiceNumber: readText(formData, "invoiceNumber"),
    packName: readText(formData, "packName"),
    service: readText(formData, "service"),
    need: readText(formData, "need"),
    urgency: readText(formData, "urgency"),
    amount: readText(formData, "amount"),
    paymentStatus: readText(formData, "paymentStatus") || "Paiement attendu",
    pickup: readText(formData, "pickup"),
    destination: readText(formData, "destination"),
    pickupMapUrl: readText(formData, "pickupMapUrl"),
    destinationMapUrl: readText(formData, "destinationMapUrl"),
    packageType: readText(formData, "packageType"),
    notes: readText(formData, "notes"),
    status: readStatus(formData),
  };
}

async function requireOperator() {
  if (!(await isOperatorAuthenticated())) {
    redirect("/operator/login");
  }
}

export async function loginAction(formData: FormData) {
  const password = readText(formData, "password");

  if (verifyAdminPassword(password)) {
    await createOperatorSession();
    redirect("/operator");
  }

  redirect("/operator/login?error=1");
}

export async function logoutAction() {
  await destroyOperatorSession();
  redirect("/operator/login");
}

export async function createOrderAction(formData: FormData) {
  await requireOperator();
  const order = await createOrder(readOrderInput(formData));

  revalidatePath("/operator");
  redirect(`/operator?order=${order.trackingCode}`);
}

export async function updateOrderAction(formData: FormData) {
  await requireOperator();
  const orderId = readText(formData, "orderId");

  if (orderId) {
    const order = await updateOrder(orderId, readOrderInput(formData));
    revalidatePath("/operator");

    if (order) {
      revalidatePath(`/track/${order.trackingCode}`);
      redirect(`/operator?order=${order.trackingCode}`);
    }
  }

  redirect("/operator");
}
