"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, MoreVertical, Share2, Smartphone } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function isMobileDevice() {
  return (
    window.matchMedia("(max-width: 900px)").matches &&
    (navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  );
}

export function PwaInstallGate() {
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
    };

    setIsIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    refreshState();
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", refreshState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", refreshState);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalling(false);
    if (choice.outcome === "accepted") setNeedsInstall(false);
  }

  if (!needsInstall) return null;

  return (
    <div className="fixed inset-0 z-[120] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-ink px-4 py-8 text-white">
      <section className="w-full max-w-md text-center" aria-labelledby="install-title">
        <Image
          src="/icons/icon-192.png"
          alt="Logo Mr. Delivery"
          width={88}
          height={88}
          priority
          className="mx-auto h-20 w-20 rounded-2xl border border-white/10 object-cover shadow-gold"
        />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-gold">Suivi mobile sécurisé</p>
        <h1 id="install-title" className="mt-2 text-3xl font-black leading-tight">
          Installez Mr. Delivery
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/70">
          L&apos;application installée vous permet de suivre le colis et de recevoir chaque changement de statut.
        </p>

        {promptEvent ? (
          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
          >
            <Download size={19} />
            {installing ? "Installation..." : "Installer l'application"}
          </button>
        ) : (
          <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5 text-left">
            <p className="flex items-center gap-2 font-black text-gold">
              <Smartphone size={18} /> Installation en quelques secondes
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-white/75">
              <li className="flex gap-3">
                <span className="font-black text-gold">1.</span>
                <span className="flex items-center gap-2">
                  Touchez {isIos ? <Share2 size={17} /> : <MoreVertical size={17} />} dans le navigateur.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-gold">2.</span>
                <span>Choisissez « Ajouter à l&apos;écran d&apos;accueil » ou « Installer l&apos;application ».</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-gold">3.</span>
                <span>Ouvrez ensuite Mr. Delivery depuis son icône.</span>
              </li>
            </ol>
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-white/45">Aucune installation n&apos;est exigée sur ordinateur.</p>
      </section>
    </div>
  );
}
