"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BellRing, Download, MapPin, MoreVertical, PackageCheck, Share2, Smartphone, Truck } from "lucide-react";
import { track } from "@vercel/analytics";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { triggerHaptic } from "@/lib/haptics";
import { motion, prefersReducedMotion } from "@/lib/motion";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function isMobileDevice() {
  return window.matchMedia("(max-width: 900px)").matches &&
    (navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
}

export function PwaInstallGate() {
  const scope = useRef<HTMLDivElement>(null);
  const gateTrackedRef = useRef(false);
  const [needsInstall, setNeedsInstall] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const refreshState = () => setNeedsInstall(isMobileDevice() && !isStandalone());
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      refreshState();
      track("pwa_install_prompt_available");
    };
    const handleInstalled = () => {
      refreshState();
      triggerHaptic("success");
      track("pwa_installed");
    };

    setIsIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    refreshState();
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!needsInstall || gateTrackedRef.current) return;
    gateTrackedRef.current = true;
    track("pwa_install_gate_shown");
  }, [needsInstall]);

  useGSAP(
    () => {
      if (!needsInstall || prefersReducedMotion()) return;
      const scene = scope.current?.querySelector<HTMLElement>(".install-scene");
      const truckDistance = Math.max((scene?.clientWidth ?? 320) - 92, 150);
      const timeline = gsap.timeline({ defaults: { ease: motion.ease.enter } });
      timeline
        .from(".install-panel > *", { autoAlpha: 0, y: 12, duration: 0.42, stagger: 0.055 })
        .fromTo(".install-route", { scaleX: 0 }, { scaleX: 1, duration: 0.65, transformOrigin: "left", ease: motion.ease.exit }, "-=0.25")
        .fromTo(".install-truck", { x: 0 }, { x: truckDistance, duration: 0.72, ease: motion.ease.exit }, "-=0.62")
        .from(".install-benefit", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.05 }, "-=0.25");
    },
    { scope, dependencies: [needsInstall] },
  );

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    triggerHaptic("select");
    track("pwa_install_started");
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalling(false);
    if (choice.outcome === "accepted") {
      setNeedsInstall(false);
      triggerHaptic("success");
    } else {
      track("pwa_install_dismissed");
    }
  }

  if (!needsInstall) return null;

  return (
    <div ref={scope} className="fixed inset-0 z-[120] overflow-y-auto bg-ink px-4 py-6 text-white">
      <section className="install-panel mx-auto flex min-h-full w-full max-w-md flex-col justify-center" aria-labelledby="install-title">
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="Logo Mr. Delivery" width={64} height={64} priority className="h-14 w-14 rounded-xl border border-white/10 object-cover" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gold">Suivi mobile</p>
            <p className="mt-1 font-black">Mr. Delivery</p>
          </div>
        </div>

        <h1 id="install-title" className="mt-6 text-3xl font-black leading-tight">Votre colis reste avec vous</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          Installez l’application pour ouvrir le suivi rapidement et recevoir chaque changement de statut.
        </p>

        <div className="install-scene relative mt-6 h-16 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-5" aria-hidden="true">
          <span className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
          <span className="install-route absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gold" size={20} />
          <span className="install-truck absolute left-9 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft">
            <Truck size={18} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="install-benefit rounded-xl border border-white/10 bg-white/5 p-3">
            <BellRing className="text-gold" size={20} />
            <p className="mt-2 text-sm font-black">Alertes de statut</p>
          </div>
          <div className="install-benefit rounded-xl border border-white/10 bg-white/5 p-3">
            <PackageCheck className="text-gold" size={20} />
            <p className="mt-2 text-sm font-black">Suivi en un geste</p>
          </div>
        </div>

        {promptEvent ? (
          <button type="button" onClick={install} disabled={installing} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink shadow-gold transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70">
            <Download size={19} /> {installing ? "Installation..." : "Installer Mr. Delivery"}
          </button>
        ) : (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 font-black text-gold"><Smartphone size={18} /> Installation en 3 étapes</p>
            <ol className="mt-3 space-y-2.5 text-sm leading-6 text-white/75">
              <li className="flex gap-3"><span className="font-black text-gold">1.</span><span className="flex items-center gap-2">Touchez {isIos ? <Share2 size={17} /> : <MoreVertical size={17} />} dans le navigateur.</span></li>
              <li className="flex gap-3"><span className="font-black text-gold">2.</span><span>Choisissez « Ajouter à l’écran d’accueil » ou « Installer ».</span></li>
              <li className="flex gap-3"><span className="font-black text-gold">3.</span><span>Ouvrez Mr. Delivery depuis sa nouvelle icône.</span></li>
            </ol>
          </div>
        )}

        <a href="/" className="mt-4 inline-flex min-h-11 items-center justify-center text-sm font-black text-white/60">Retour à l’accueil</a>
      </section>
    </div>
  );
}
