"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { track } from "@vercel/analytics";
import { triggerHaptic } from "@/lib/haptics";

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000;

type VersionResponse = {
  version?: string;
};

export function PwaRegistration({ currentVersion }: { currentVersion: string }) {
  const reportedVersionRef = useRef("");
  const [availableVersion, setAvailableVersion] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        void registration.update();
      } catch {
        // The website remains fully usable when service workers are unavailable.
      }
    };

    if (document.readyState === "complete") {
      void register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_app_version")) return;
    url.searchParams.delete("_app_version");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (currentVersion === "development") return;
    let disposed = false;

    const checkVersion = async () => {
      if (!navigator.onLine || document.visibilityState === "hidden") return;

      try {
        const response = await fetch(`/api/version?time=${Date.now()}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;

        const payload = (await response.json()) as VersionResponse;
        const nextVersion = payload.version?.trim();
        if (!disposed && nextVersion && nextVersion !== "development" && nextVersion !== currentVersion) {
          setAvailableVersion(nextVersion);
          if (reportedVersionRef.current !== nextVersion) {
            reportedVersionRef.current = nextVersion;
            track("pwa_update_available");
          }
        }
      } catch {
        // A temporary network failure must not block the current version.
      }
    };

    const initialCheck = window.setTimeout(checkVersion, 2500);
    const interval = window.setInterval(checkVersion, VERSION_CHECK_INTERVAL);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", checkVersion);
    return () => {
      disposed = true;
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", checkVersion);
    };
  }, [currentVersion]);

  async function applyUpdate() {
    if (!availableVersion || isUpdating) return;
    setIsUpdating(true);
    triggerHaptic("select");
    track("pwa_update_started");

    try {
      const registration = await navigator.serviceWorker?.getRegistration("/");
      await registration?.update();
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.set("_app_version", availableVersion.slice(0, 16));
      window.location.replace(url.toString());
    }
  }

  if (!availableVersion) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-ink/90 px-4 py-8 backdrop-blur"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="update-title"
    >
      <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-5 text-center text-ink shadow-soft sm:p-6">
        <Image
          src="/icons/icon-white-192.png"
          alt="Icône Mr Delivery"
          width={72}
          height={72}
          className="mx-auto h-16 w-16 rounded-xl border border-ink/8 object-cover"
        />
        <span className="mx-auto mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-[#946500]">
          <ShieldCheck size={23} />
        </span>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#946500]">Nouvelle version disponible</p>
        <h2 id="update-title" className="mt-2 text-2xl font-black">Mise à jour requise</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Mr Delivery vient d’être amélioré. Mettez l’application à jour pour continuer avec la version la plus fiable.
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          disabled={isUpdating}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-70"
        >
          <RefreshCw className={isUpdating ? "animate-spin" : ""} size={18} />
          {isUpdating ? "Mise à jour..." : "Mettre à jour maintenant"}
        </button>
        <p className="mt-3 text-xs font-semibold text-neutral-500">Vos notifications et votre accès au suivi seront conservés.</p>
      </section>
    </div>
  );
}
