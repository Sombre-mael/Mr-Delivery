"use client";

import { BadgeCheck, FileText, MessageCircle, Package, Truck, UserCheck } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DeliveryMotion } from "@/components/DeliveryMotion";
import { steps, type IconName } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const icons: Record<IconName, React.ComponentType<{ size?: number }>> = {
  fileText: FileText,
  message: MessageCircle,
  userCheck: UserCheck,
  badgeCheck: BadgeCheck,
  zap: FileText,
  package: FileText,
  shirt: FileText,
  gem: BadgeCheck,
  gift: BadgeCheck,
  heartPulse: BadgeCheck,
  truck: UserCheck,
  mapPin: UserCheck,
};

export function HowItWorks() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top 72%",
          once: true,
        },
      });

      timeline
        .from(".process-driver", {
          autoAlpha: 0,
          x: isMobile ? -16 : -28,
          duration: 0.45,
          ease: "power2.out",
        })
        .to(".process-track-fill", {
          scaleX: 1,
          transformOrigin: "left center",
          duration: isMobile ? 0.9 : 0.7,
          ease: "power2.inOut",
        }, "-=0.18")
        .to(".process-driver", {
          x: isMobile ? "74vw" : 320,
          y: isMobile ? 0 : -2,
          duration: isMobile ? 1.15 : 0.9,
          ease: "power1.inOut",
        }, "-=0.78")
        .from(".process-card", {
          autoAlpha: 0,
          y: isMobile ? 14 : 28,
          scale: isMobile ? 0.99 : 1,
          duration: isMobile ? 0.72 : 0.62,
          ease: isMobile ? "power2.out" : "power3.out",
          stagger: isMobile ? 0.08 : 0.12,
        }, "-=0.35")
        .from(".process-line", { scaleX: 0, transformOrigin: "left", duration: 0.45, stagger: 0.12 }, "-=0.36");
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="fonctionnement"
      data-nav-theme="dark"
      className="bg-ink px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Processus</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Commander en 4 etapes simples</h2>
        </div>

        <div className="mt-8 max-w-3xl">
          <DeliveryMotion />
        </div>

        <div className="relative mt-8 h-16 overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-5 lg:hidden">
          <div className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/12" />
          <div className="process-track-fill absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 scale-x-[0.08] rounded-full bg-gold" />
          <div className="process-driver absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-gold px-3 py-2 text-ink shadow-gold">
            <Truck size={18} />
            <Package size={15} />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = icons[step.icon];

            return (
              <article
                key={step.title}
                className="process-card relative rounded-lg border border-white/12 bg-white/7 p-5 backdrop-blur"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink">
                    <Icon size={23} />
                  </div>
                  <span className="text-5xl font-black text-white/10">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{step.description}</p>
                {index < steps.length - 1 ? (
                  <div className="process-line absolute -right-4 top-10 hidden h-px w-8 bg-gold/60 lg:block" />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
