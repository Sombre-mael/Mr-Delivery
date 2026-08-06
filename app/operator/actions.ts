"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createOperatorSession, destroyOperatorSession, isOperatorAuthenticated, verifyAdminPassword } from "@/lib/operator-auth";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "@/lib/login-rate-limit";
import { createOrder, setOrderArchived, updateOrderWithStatusChange, type OrderInput } from "@/lib/orders";
import { OrderValidationError, validateOrderInput } from "@/lib/order-validation";
import { sendOrderStatusNotification } from "@/lib/push-notifications";
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
    internalNotes: readText(formData, "internalNotes"),
    publicNote: readText(formData, "publicNote"),
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
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  let validPassword = false;
  let blocked = false;

  try {
    blocked = await isLoginBlocked(ip);
    if (!blocked) {
      validPassword = verifyAdminPassword(password);
      if (!validPassword) {
        await recordLoginFailure(ip);
      }
    }
  } catch (error) {
    console.error("Operator auth configuration error", error);
    redirect("/operator/login?error=config");
  }

  if (blocked) {
    redirect("/operator/login?error=blocked");
  }

  if (validPassword) {
    await clearLoginFailures(ip);
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
  let order;

  try {
    order = await createOrder(validateOrderInput(readOrderInput(formData)));
  } catch (error) {
    if (error instanceof OrderValidationError) {
      redirect(`/operator?error=${encodeURIComponent(error.message)}`);
    }
    console.error("Order creation failed", error);
    redirect("/operator?error=save");
  }

  revalidatePath("/operator");
  redirect(`/operator?order=${order.trackingCode}&saved=created`);
}

export async function updateOrderAction(formData: FormData) {
  await requireOperator();
  const orderId = readText(formData, "orderId");

  if (orderId) {
    let order;
    try {
      const result = await updateOrderWithStatusChange(orderId, validateOrderInput(readOrderInput(formData)));
      order = result.order;
      if (order && result.statusChanged) {
        await sendOrderStatusNotification(order).catch((error) => console.error("Order push failed", error));
      }
    } catch (error) {
      if (error instanceof OrderValidationError) {
        redirect(`/operator?order=${readText(formData, "trackingCode")}&error=${encodeURIComponent(error.message)}`);
      }
      console.error("Order update failed", error);
      redirect("/operator?error=save");
    }

    revalidatePath("/operator");
    if (order) {
      revalidatePath(`/track/${order.trackingCode}`);
      redirect(`/operator?order=${order.trackingCode}&saved=updated`);
    }
  }

  redirect("/operator");
}

export async function archiveOrderAction(formData: FormData) {
  await requireOperator();
  const orderId = readText(formData, "orderId");
  const archived = readText(formData, "archived") === "true";

  if (orderId) {
    await setOrderArchived(orderId, archived);
    revalidatePath("/operator");
  }

  redirect(`/operator?saved=${archived ? "archived" : "restored"}`);
}
