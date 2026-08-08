"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { track } from "@vercel/analytics";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { trackOrderAction } from "@/app/track/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { triggerHaptic } from "@/lib/haptics";
import { prefersReducedMotion } from "@/lib/motion";

type TrackingCodeFormProps = {
  source: "home" | "tracking_page";
  error?: "missing" | "invalid";
  horizontal?: boolean;
};

export function TrackingCodeForm({ source, error, horizontal = false }: TrackingCodeFormProps) {
  const scope = useRef<HTMLFormElement>(null);
  const [code, setCode] = useState("");

  useGSAP(
    () => {
      if (!error || prefersReducedMotion()) return;
      gsap.fromTo(".tracking-error", { x: -5 }, { x: 0, duration: 0.38, ease: "elastic.out(1, 0.35)" });
    },
    { scope, dependencies: [error] },
  );

  return (
    <form
      ref={scope}
      action={trackOrderAction}
      onSubmit={() => {
        triggerHaptic("select");
        track("tracking_search", { source });
      }}
      className={horizontal ? "flex flex-col gap-3 sm:flex-row" : "space-y-4"}
    >
      <label className={horizontal ? "min-w-0 flex-1" : "block"}>
        <span className={horizontal ? "sr-only" : "text-xs font-black uppercase tracking-[0.12em] text-neutral-500"}>Code de suivi</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
          <input
            name="trackingCode"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="MRD-ABC123"
            required
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={32}
            className="min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] py-3 pl-11 pr-4 text-sm font-black uppercase outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
          />
        </div>
      </label>

      {error ? (
        <p className={`tracking-error rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ${horizontal ? "sm:order-last sm:w-full" : ""}`} role="alert">
          {error === "missing" ? "Ajoutez votre code de suivi avant de continuer." : "Ce code ne semble pas valide. Vérifiez-le puis réessayez."}
        </p>
      ) : null}

      <PendingSubmitButton
        idleLabel="Suivre mon colis"
        pendingLabel="Recherche..."
        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-ink px-6 text-sm font-black text-white shadow-soft transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-70"
      />
    </form>
  );
}
