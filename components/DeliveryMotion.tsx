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
        gsap.set(".motion-route-fill, .motion-truck, .motion-pin-end, .motion-pulse, .motion-speed", {
          clearProps: "all",
        });
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: isMobile ? 0.65 : 0.42 });

      const travelDistance = () => {
        const width = scope.current?.clientWidth ?? (isMobile ? 320 : 520);
        return Math.max(width - (compact ? 112 : 128), isMobile ? 190 : 260);
      };

      gsap.set(".motion-truck", { x: -10, y: 0, rotate: 0 });
      gsap.set(".motion-route-fill", { scaleX: 0.04, transformOrigin: "left center" });
      gsap.set(".motion-pulse", { scale: 0.35, autoAlpha: 0 });

      timeline
        .to(".motion-route-fill", {
          scaleX: 1,
          duration: isMobile ? 1.75 : 1.35,
          ease: "power2.inOut",
        })
        .to(
          ".motion-truck",
          {
            x: travelDistance,
            y: isMobile ? -3 : -5,
            rotate: isMobile ? 1.2 : 1.8,
            duration: isMobile ? 2.05 : 1.72,
            ease: "power1.inOut",
          },
          "-=1.55",
        )
        .to(
          ".motion-truck",
          {
            y: 1,
            rotate: -0.7,
            duration: 0.18,
            repeat: isMobile ? 3 : 4,
            yoyo: true,
            ease: "sine.inOut",
          },
          "-=1.55",
        )
        .to(".motion-package", { y: -5, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=1.1")
        .fromTo(
          ".motion-speed",
          { scaleX: 0, autoAlpha: 0, transformOrigin: "right center" },
          { scaleX: 1, autoAlpha: 1, duration: 0.28, stagger: 0.07, ease: "power2.out" },
          "-=1.25",
        )
        .to(".motion-speed", { autoAlpha: 0, duration: 0.22, stagger: 0.04 }, "-=0.72")
        .to(".motion-pin-end", { scale: 1.15, duration: 0.24, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.28")
        .to(".motion-pulse", { scale: isMobile ? 2.1 : 2.6, autoAlpha: 0.24, duration: 0.42, ease: "power2.out" }, "-=0.28")
        .to(".motion-pulse", { autoAlpha: 0, duration: 0.25 }, "-=0.1")
        .to(".motion-route-fill", { opacity: 0.45, duration: 0.26, ease: "sine.out" }, "+=0.04")
        .set(".motion-route-fill", { opacity: 1 });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className={`relative overflow-hidden rounded-2xl border border-ink/8 bg-white/92 shadow-soft ${
        compact ? "h-24 p-4 sm:h-24" : "h-32 p-4 sm:h-36 sm:p-5"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/10" />
      <div className="motion-route-fill absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
      <div className="absolute left-5 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <span className="absolute h-7 w-7 rounded-full bg-ink/8" />
        <MapPin className="relative text-ink" size={compact ? 19 : 23} />
      </div>
      <div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <span className="motion-pulse absolute h-7 w-7 rounded-full bg-gold" />
        <MapPin className="motion-pin-end relative text-gold" size={compact ? 19 : 23} />
      </div>
      <span className="motion-speed absolute left-[18%] top-[42%] h-0.5 w-10 rounded-full bg-gold/60" />
      <span className="motion-speed absolute left-[28%] top-[58%] h-0.5 w-7 rounded-full bg-ink/20" />
      <span className="motion-speed absolute left-[39%] top-[45%] h-0.5 w-9 rounded-full bg-gold/50" />
      <div className="motion-truck absolute left-7 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-ink px-3 py-2 text-white shadow-soft will-change-transform">
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
