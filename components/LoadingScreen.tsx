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

      const timeline = gsap.timeline();
      timeline
        .from(".loader-logo", { autoAlpha: 0, y: 16, duration: 0.45, ease: "power3.out" })
        .from(".loader-road", { scaleX: 0, transformOrigin: "left", duration: 0.55, ease: "power2.out" }, "-=0.2")
        .fromTo(
          ".loader-truck",
          { xPercent: -120, rotate: -2 },
          { xPercent: 120, rotate: 2, duration: 1.05, ease: "power2.inOut" },
          "-=0.25",
        )
        .from(".loader-package", { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.08 }, "-=0.85")
        .to(scope.current, { autoAlpha: 0, duration: 0.38, ease: "power2.in", delay: 0.18 });
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
        <p className="mt-5 text-sm font-black uppercase tracking-[0.24em] text-gold">Mr. Delivery</p>
        <h1 className="mt-2 text-3xl font-black">Preparation de votre course</h1>

        <div className="relative mt-8 h-16 overflow-hidden">
          <div className="loader-road absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
          <div className="loader-truck absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-ink shadow-soft">
            <Truck size={22} />
            <span className="text-xs font-black">En route</span>
          </div>
          <Package className="loader-package absolute left-[18%] top-1 text-gold" size={18} />
          <Package className="loader-package absolute left-[72%] bottom-1 text-gold" size={18} />
        </div>
      </div>
    </div>
  );
}
