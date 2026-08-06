import { NextResponse } from "next/server";
import { getOrderByTrackingCode } from "@/lib/orders";
import { normalizeTrackingCode } from "@/lib/order-utils";
import { savePushSubscription } from "@/lib/push-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      trackingCode?: unknown;
      subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    };
    const trackingCode = normalizeTrackingCode(String(body.trackingCode || ""));
    const endpoint = String(body.subscription?.endpoint || "");
    const p256dh = String(body.subscription?.keys?.p256dh || "");
    const auth = String(body.subscription?.keys?.auth || "");

    if (
      !trackingCode ||
      !endpoint.startsWith("https://") ||
      endpoint.length > 2048 ||
      !p256dh ||
      p256dh.length > 512 ||
      !auth ||
      auth.length > 512
    ) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const order = await getOrderByTrackingCode(trackingCode);
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    await savePushSubscription(order.id, { endpoint, keys: { p256dh, auth } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscription failed", error);
    return NextResponse.json({ error: "Activation impossible" }, { status: 500 });
  }
}
