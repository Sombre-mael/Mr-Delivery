"use client";

import { useRef } from "react";
import { MapPin, Package, Truck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type DeliveryMotionProps = {
  compact?: boolean;
};

export function DeliveryMotion({ compact = false }: DeliveryMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.35, defaults: { ease: "power2.inOut" } });
      timeline
        .fromTo(".motion-route", { scaleX: 0.08 }, { scaleX: 1, duration: 1.1, transformOrigin: "left" })
        .fromTo(".motion-truck", { x: "-6%" }, { x: "88%", duration: 1.55 }, "-=0.9")
        .to(".motion-package", { y: -8, duration: 0.28, yoyo: true, repeat: 1 }, "-=0.85")
        .to(".motion-pin-end", { scale: 1.18, duration: 0.22, yoyo: true, repeat: 1 }, "-=0.18")
        .to(".motion-route", { opacity: 0.35, duration: 0.25 }, "+=0.08")
        .set(".motion-route", { opacity: 1 });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className={`relative overflow-hidden rounded-2xl border border-ink/8 bg-white/92 shadow-soft ${
        compact ? "h-24 p-4" : "h-36 p-5"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/10" />
      <div className="motion-route absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" size={compact ? 19 : 23} />
      <MapPin className="motion-pin-end absolute right-5 top-1/2 -translate-y-1/2 text-gold" size={compact ? 19 : 23} />
      <div className="motion-truck absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-ink px-3 py-2 text-white shadow-soft">
        <Truck size={compact ? 18 : 22} />
        <Package className="motion-package text-gold" size={compact ? 15 : 18} />
      </div>
      {!compact ? (
        <>
          <span className="absolute left-6 top-5 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            Ramassage
          </span>
          <span className="absolute bottom-5 right-6 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            Livraison
          </span>
        </>
      ) : null}
    </div>
  );
}
