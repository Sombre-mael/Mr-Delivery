"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createAccountSession,
  createEmergencySession,
  destroyOperatorSession,
  isEmergencyAccessEnabled,
  requireOperatorIdentity,
  verifyEmergencyPassword,
} from "@/lib/operator-auth";
import {
  clearAccountLoginFailures,
  clearEmergencyLoginFailures,
  isAccountLoginBlocked,
  isEmergencyLoginBlocked,
  recordAccountLoginFailure,
  recordEmergencyLoginFailure,
} from "@/lib/login-rate-limit";
import {
  getOperatorMemberCredentials,
  logOperatorActivity,
  markOperatorLogin,
  setOperatorMemberPassword,
} from "@/lib/operator-members";
import {
  hashOperatorPassword,
  validateOperatorPassword,
  verifyOperatorPassword,
} from "@/lib/operator-password";
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

const DUMMY_PASSWORD_HASH = hashOperatorPassword("MrDelivery-Invalid-Account-2026!");

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
  return requireOperatorIdentity();
}

export async function loginAction(formData: FormData) {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";

  try {
    if (await isAccountLoginBlocked(ip, email)) {
      redirect("/operator/login?error=blocked");
    }

    const credentials = await getOperatorMemberCredentials(email);
    const validHash = credentials?.passwordHash || DUMMY_PASSWORD_HASH;
    const passwordMatches = verifyOperatorPassword(password, validHash);
    const validPassword = Boolean(credentials?.member.isActive && credentials.passwordHash && passwordMatches);

    if (!validPassword || !credentials) {
      await recordAccountLoginFailure(ip, email);
      redirect("/operator/login?error=credentials");
    }

    await clearAccountLoginFailures(ip, email);
    await markOperatorLogin(credentials.member.email);
    await createAccountSession(credentials.member);
    await logOperatorActivity({
      actorEmail: credentials.member.email,
      action: "signed_in",
      entityType: "operator",
      entityId: credentials.member.email,
      summary: "Connexion réussie",
    }).catch((error) => console.error("Operator activity log failed", error));

    redirect(credentials.member.mustChangePassword ? "/operator/change-password" : "/operator");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Operator login failed", error);
    redirect("/operator/login?error=service");
  }
}

export async function emergencyLoginAction(formData: FormData) {
  if (!isEmergencyAccessEnabled()) redirect("/operator/login");
  const password = readText(formData, "password");
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  try {
    if (await isEmergencyLoginBlocked(ip)) redirect("/operator/secours?error=blocked");
    if (!verifyEmergencyPassword(password)) {
      await recordEmergencyLoginFailure(ip);
      redirect("/operator/secours?error=credentials");
    }
    await clearEmergencyLoginFailures(ip);
    await createEmergencySession();
    await logOperatorActivity({
      actorEmail: "acces-secours@mr-delivery.local",
      action: "emergency_sign_in",
      entityType: "operator",
      entityId: "emergency",
      summary: "Accès administrateur de secours utilisé",
    }).catch((error) => console.error("Emergency activity log failed", error));
    redirect("/operator/team");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Emergency operator login failed", error);
    redirect("/operator/secours?error=service");
  }
}

export async function changePasswordAction(formData: FormData) {
  const identity = await requireOperatorIdentity({ allowPasswordChange: true });
  if (identity.authMode !== "account") redirect("/operator");

  const password = readText(formData, "password");
  const confirmation = readText(formData, "confirmation");
  const validationError = validateOperatorPassword(password);
  if (validationError) redirect(`/operator/change-password?error=${encodeURIComponent(validationError)}`);
  if (password !== confirmation) redirect("/operator/change-password?error=confirmation");

  const member = await setOperatorMemberPassword(identity.email, hashOperatorPassword(password), false);
  if (!member) redirect("/operator/login?error=session");

  await createAccountSession(member);
  await logOperatorActivity({
    actorEmail: identity.email,
    action: "password_changed",
    entityType: "operator",
    entityId: identity.email,
    summary: "Mot de passe personnel défini",
  }).catch((error) => console.error("Operator activity log failed", error));
  redirect("/operator?saved=password");
}

export async function logoutAction() {
  await destroyOperatorSession();
  redirect("/operator/login");
}

export async function createOrderAction(formData: FormData) {
  const identity = await requireOperator();
  let order;

  try {
    order = await createOrder(validateOrderInput(readOrderInput(formData)));
  } catch (error) {
    if (error instanceof OrderValidationError) {
      redirect(`/operator/orders?error=${encodeURIComponent(error.message)}`);
    }
    console.error("Order creation failed", error);
    redirect("/operator/orders?error=save");
  }

  await logOperatorActivity({
    actorEmail: identity.email,
    action: "created",
    entityType: "order",
    entityId: order.id,
    summary: `Commande ${order.trackingCode} créée pour ${order.customerName}`,
  }).catch((error) => console.error("Operator activity log failed", error));

  revalidatePath("/operator");
  redirect(`/operator/orders?order=${order.trackingCode}&saved=created`);
}

export async function updateOrderAction(formData: FormData) {
  const identity = await requireOperator();
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
      redirect(`/operator/orders?order=${readText(formData, "trackingCode")}&error=${encodeURIComponent(error.message)}`);
      }
      console.error("Order update failed", error);
      redirect("/operator/orders?error=save");
    }

    revalidatePath("/operator");
    if (order) {
      await logOperatorActivity({
        actorEmail: identity.email,
        action: "updated",
        entityType: "order",
        entityId: order.id,
        summary: `Commande ${order.trackingCode} mise à jour`,
      }).catch((error) => console.error("Operator activity log failed", error));
      revalidatePath(`/track/${order.trackingCode}`);
      redirect(`/operator/orders?order=${order.trackingCode}&saved=updated`);
    }
  }

  redirect("/operator/orders");
}

export async function archiveOrderAction(formData: FormData) {
  const identity = await requireOperator();
  const orderId = readText(formData, "orderId");
  const archived = readText(formData, "archived") === "true";

  if (orderId) {
    await setOrderArchived(orderId, archived);
    await logOperatorActivity({
      actorEmail: identity.email,
      action: archived ? "archived" : "restored",
      entityType: "order",
      entityId: orderId,
      summary: archived ? "Commande archivée" : "Commande restaurée",
    }).catch((error) => console.error("Operator activity log failed", error));
    revalidatePath("/operator");
  }

  redirect(`/operator/orders?saved=${archived ? "archived" : "restored"}`);
}
