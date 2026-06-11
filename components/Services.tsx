"use client";

import { FileText, Gem, Gift, HeartPulse, Package, Shirt, Truck, Zap } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GsapReveal } from "@/components/GsapReveal";
import { services, type IconName } from "@/lib/data";

gsap.registerPlugin(useGSAP);

const icons: Record<IconName, React.ComponentType<{ size?: number }>> = {
  zap: Zap,
  package: Package,
  fileText: FileText,
  shirt: Shirt,
  gem: Gem,
  gift: Gift,
  heartPulse: HeartPulse,
  truck: Truck,
  message: FileText,
  userCheck: Package,
  badgeCheck: Gem,
  mapPin: Truck,
};

export function Services() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>(".service-card");
      const cleanups = cards.map((card) => {
        const icon = card.querySelector(".service-icon");
        const enter = () => gsap.to(card, { y: -8, duration: 0.25, ease: "power2.out" });
        const leave = () => gsap.to(card, { y: 0, duration: 0.25, ease: "power2.out" });
        const iconEnter = () => icon && gsap.to(icon, { rotate: -6, scale: 1.08, duration: 0.25, ease: "power2.out" });
        const iconLeave = () => icon && gsap.to(icon, { rotate: 0, scale: 1, duration: 0.25, ease: "power2.out" });

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseenter", iconEnter);
        card.addEventListener("mouseleave", leave);
        card.addEventListener("mouseleave", iconLeave);

        return () => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseenter", iconEnter);
          card.removeEventListener("mouseleave", leave);
          card.removeEventListener("mouseleave", iconLeave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope },
  );

  return (
    <section ref={scope} id="services" data-nav-theme="light" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Services</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            Une livraison adaptee a chaque besoin
          </h2>
        </div>

        <GsapReveal selector=".service-card" className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = icons[service.icon];

            return (
              <article
                key={service.title}
                className="service-card group rounded-lg border border-ink/8 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold/55 hover:shadow-gold"
              >
                <div className="service-icon flex h-12 w-12 items-center justify-center rounded-lg bg-amberSoft text-ink transition group-hover:bg-gold">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-black text-ink">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{service.description}</p>
              </article>
            );
          })}
        </GsapReveal>
      </div>
    </section>
  );
}
