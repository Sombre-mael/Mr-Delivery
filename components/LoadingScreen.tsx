"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Truck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function LoadingScreen() {
  const scope = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), 1900);
    return () => window.clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(scope.current, { autoAlpha: 1 });
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set(".loader-ping", { scale: 0.35, autoAlpha: 0 });
      gsap.set(".loader-speed", { scaleX: 0, autoAlpha: 0, transformOrigin: "right center" });

      timeline
        .from(".loader-logo", { autoAlpha: 0, y: isMobile ? 10 : 16, scale: 0.92, duration: 0.48 })
        .from(".loader-title", { autoAlpha: 0, y: isMobile ? 8 : 14, duration: 0.42, stagger: 0.06 }, "-=0.22")
        .from(".loader-road-base", { autoAlpha: 0, duration: 0.28 }, "-=0.12")
        .from(".loader-road", { scaleX: 0, transformOrigin: "left", duration: isMobile ? 0.85 : 0.68, ease: "power2.inOut" }, "-=0.08")
        .from(".loader-package", { autoAlpha: 0, y: -8, scale: 0.8, duration: 0.3, stagger: 0.08 }, "-=0.55")
        .fromTo(
          ".loader-truck",
          { xPercent: -118, y: 0, rotate: -1.5 },
          { xPercent: isMobile ? 94 : 118, y: -2, rotate: 1.2, duration: isMobile ? 1.38 : 1.14, ease: "power1.inOut" },
          "-=0.7",
        )
        .to(".loader-truck", { y: 1, rotate: -0.5, duration: 0.16, repeat: 2, yoyo: true, ease: "sine.inOut" }, "-=1.0")
        .to(".loader-speed", { scaleX: 1, autoAlpha: 1, duration: 0.24, stagger: 0.06 }, "-=0.95")
        .to(".loader-speed", { autoAlpha: 0, duration: 0.22, stagger: 0.04 }, "-=0.58")
        .to(".loader-ping", { autoAlpha: 0.24, scale: isMobile ? 2.2 : 2.7, duration: 0.42, ease: "power2.out" }, "-=0.25")
        .to(".loader-ping", { autoAlpha: 0, duration: 0.22 }, "-=0.08")
        .to(".loader-status", { autoAlpha: 1, y: 0, duration: 0.28 }, "-=0.28")
        .to(scope.current, { autoAlpha: 0, duration: 0.52, ease: "power2.inOut", delay: 0.2 });
    },
    { scope },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={scope}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink px-6 text-white"
      aria-label="Chargement Mr. Delivery"
    >
      <div className="w-full max-w-md text-center">
        <div className="loader-logo mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gold text-ink shadow-gold">
          <Truck size={42} />
        </div>
        <p className="loader-title mt-5 text-sm font-black uppercase tracking-[0.24em] text-gold">Mr. Delivery</p>
        <h1 className="loader-title mt-2 text-2xl font-black sm:text-3xl">Preparation de votre course</h1>

        <div className="relative mt-8 h-20 overflow-hidden px-3">
          <div className="loader-road-base absolute left-3 right-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/12" />
          <div className="loader-road absolute left-3 right-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
          <span className="loader-ping absolute right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-gold" />
          <span className="loader-speed absolute left-[28%] top-[39%] h-0.5 w-10 rounded-full bg-white/55" />
          <span className="loader-speed absolute left-[38%] top-[58%] h-0.5 w-7 rounded-full bg-gold/70" />
          <div className="loader-truck absolute left-[42%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-ink shadow-soft will-change-transform">
            <Truck size={22} />
            <span className="text-xs font-black">En route</span>
          </div>
          <Package className="loader-package absolute left-[18%] top-1 text-gold" size={18} />
          <Package className="loader-package absolute left-[72%] bottom-1 text-gold" size={18} />
        </div>
        <p className="loader-status mt-3 translate-y-2 text-xs font-black uppercase tracking-[0.18em] text-white/50 opacity-0">
          Colis pris en charge
        </p>
      </div>
    </div>
  );
}
