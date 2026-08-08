"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Bell, BellOff, CheckCircle2, LoaderCircle } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { motion, prefersReducedMotion } from "@/lib/motion";

type PushState = "checking" | "unsupported" | "blocked" | "inactive" | "active" | "saving" | "error";

function toApplicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export function PushNotificationManager({ trackingCode }: { trackingCode: string }) {
  const scope = useRef<HTMLElement>(null);
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

  useGSAP(
    () => {
      if (!scope.current || state === "checking" || prefersReducedMotion()) return;
      gsap.fromTo(scope.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: motion.duration.fast, ease: motion.ease.enter });
      if (state === "active") {
        gsap.fromTo(".notification-success", { scale: 0.72 }, { scale: 1, duration: 0.5, ease: motion.ease.spring });
      }
    },
    { scope, dependencies: [state] },
  );

  async function activate() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      triggerHaptic("error");
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
      triggerHaptic("success");
      track("push_notifications_activated", { trackingCode });
      setState("active");
    } catch {
      triggerHaptic("error");
      setState("error");
    }
  }

  if (state === "checking") return null;

  if (state === "inactive" || state === "saving") {
    return (
      <section ref={scope} className="tracking-enter mt-5 flex flex-col gap-4 rounded-xl border border-gold/35 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 shrink-0 text-gold" size={22} />
          <div>
            <h2 className="font-black">Recevoir les mises à jour</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-600">Un message dès que le colis est récupéré, en route ou livré.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={activate}
          disabled={state === "saving"}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {state === "saving" ? <LoaderCircle className="animate-spin" size={17} /> : <Bell size={17} />}
          {state === "saving" ? "Activation..." : "M'avertir"}
        </button>
      </section>
    );
  }

  const content = {
    active: [CheckCircle2, "Notifications activées", "Parfait, vous serez averti à chaque changement de statut."],
    blocked: [BellOff, "Notifications bloquées", "Autorisez Mr. Delivery dans les réglages de votre téléphone."],
    unsupported: [BellOff, "Notifications non disponibles", "Ce navigateur ne prend pas en charge les notifications push."],
    error: [BellOff, "Activation impossible", "Réessayez dans un instant ou contactez Mr. Delivery sur WhatsApp."],
  } as const;
  const [Icon, title, body] = content[state];

  return (
    <section ref={scope} className="tracking-enter mt-5 flex items-start gap-3 rounded-xl border border-ink/8 bg-white p-4 shadow-soft" role="status">
      <span className={`notification-success flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${state === "active" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
        <Icon size={21} />
      </span>
      <div>
        <h2 className="font-black">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-neutral-600">{body}</p>
      </div>
    </section>
  );
}
