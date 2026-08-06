"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2, LoaderCircle } from "lucide-react";

type PushState = "checking" | "unsupported" | "blocked" | "inactive" | "active" | "saving" | "error";

function toApplicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export function PushNotificationManager({ trackingCode }: { trackingCode: string }) {
  const [state, setState] = useState<PushState>("checking");

  useEffect(() => {
    async function inspectSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const subscription = await registration.pushManager.getSubscription();
        setState(subscription ? "active" : "inactive");
      } catch {
        setState("error");
      }
    }

    void inspectSubscription();
  }, []);

  async function activate() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setState("error");
      return;
    }

    setState("saving");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "inactive");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toApplicationServerKey(publicKey),
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode, subscription: subscription.toJSON() }),
      });

      if (!response.ok) throw new Error("Subscription failed");
      setState("active");
    } catch {
      setState("error");
    }
  }

  if (state === "checking") return null;

  if (state === "inactive" || state === "saving") {
    return (
      <section className="mt-6 flex flex-col gap-4 rounded-xl border border-gold/35 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 shrink-0 text-gold" size={22} />
          <div>
            <h2 className="font-black">Recevoir les mises à jour</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-600">Soyez averti dès que le colis est récupéré, en route ou livré.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={activate}
          disabled={state === "saving"}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {state === "saving" ? <LoaderCircle className="animate-spin" size={17} /> : <Bell size={17} />}
          {state === "saving" ? "Activation..." : "Activer"}
        </button>
      </section>
    );
  }

  const content = {
    active: [CheckCircle2, "Notifications activées", "Vous serez averti à chaque changement de statut de ce colis."],
    blocked: [BellOff, "Notifications bloquées", "Autorisez les notifications de Mr. Delivery dans les réglages du téléphone."],
    unsupported: [BellOff, "Notifications non disponibles", "Ce navigateur ne prend pas en charge les notifications push."],
    error: [BellOff, "Activation impossible", "Réessayez dans un instant ou contactez Mr. Delivery sur WhatsApp."],
  } as const;
  const [Icon, title, body] = content[state];

  return (
    <section className="mt-6 flex items-start gap-3 rounded-xl border border-ink/8 bg-white p-4 shadow-soft" role="status">
      <Icon className={state === "active" ? "text-green-600" : "text-neutral-500"} size={22} />
      <div>
        <h2 className="font-black">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-neutral-600">{body}</p>
      </div>
    </section>
  );
}
