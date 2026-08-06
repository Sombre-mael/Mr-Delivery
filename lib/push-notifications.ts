import { randomUUID } from "crypto";
import webPush, { type PushSubscription } from "web-push";
import { getSql } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";
import { deliveryStatusLabels } from "@/lib/whatsapp";
import type { DeliveryOrder } from "@/lib/orders";

type BrowserSubscription = PushSubscription & { endpoint: string };

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:mrdelivery004@gmail.com";
  if (!publicKey || !privateKey) return false;
  webPush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function savePushSubscription(orderId: string, subscription: BrowserSubscription) {
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  if (!subscription.endpoint || !p256dh || !auth) throw new Error("Invalid push subscription");

  const sql = getSql();
  await sql`
    INSERT INTO push_subscriptions (id, order_id, endpoint, p256dh, auth)
    VALUES (${randomUUID()}, ${orderId}, ${subscription.endpoint}, ${p256dh}, ${auth})
    ON CONFLICT (order_id, endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      updated_at = NOW()
  `;
}

export async function sendOrderStatusNotification(order: DeliveryOrder) {
  if (!configureWebPush()) {
    console.warn("Push skipped: VAPID keys are not configured.");
    return { sent: 0 };
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE order_id = ${order.id}
  `) as Array<Record<string, unknown>>;
  const payload = JSON.stringify({
    title: `Colis ${deliveryStatusLabels[order.status]}`,
    body: order.publicNote || `Votre colis ${order.trackingCode} est maintenant : ${deliveryStatusLabels[order.status]}.`,
    url: `${getSiteUrl()}/track/${order.trackingCode}`,
    tag: `order-${order.trackingCode}`,
  });

  let sent = 0;
  await Promise.all(
    rows.map(async (row) => {
      const subscription: PushSubscription = {
        endpoint: String(row.endpoint),
        keys: { p256dh: String(row.p256dh), auth: String(row.auth) },
      };
      try {
        await webPush.sendNotification(subscription, payload, { TTL: 60 * 60 * 24 });
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${subscription.endpoint}`;
          return;
        }
        console.error("Push notification failed", error);
      }
    }),
  );

  return { sent };
}
