"use client";

import Image from "next/image";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DeliveryMotion } from "@/components/DeliveryMotion";
import { stats } from "@/lib/data";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const timeline = gsap.timeline({ defaults: { ease: isMobile ? "power2.out" : "power3.out" } });
      timeline
        .from(".hero-copy > *", { autoAlpha: 0, y: isMobile ? 12 : 24, duration: isMobile ? 0.82 : 0.72, stagger: isMobile ? 0.055 : 0.08 })
        .from(".hero-visual", { autoAlpha: 0, scale: isMobile ? 0.985 : 0.96, y: isMobile ? 10 : 0, duration: isMobile ? 0.82 : 0.8 }, "-=0.46")
        .from(".hero-delivery-motion", { autoAlpha: 0, y: isMobile ? 10 : 18, duration: isMobile ? 0.72 : 0.55 }, "-=0.38")
        .from(".hero-stat", { autoAlpha: 0, y: isMobile ? 10 : 18, duration: isMobile ? 0.55 : 0.48, stagger: isMobile ? 0.045 : 0.06 }, "-=0.42")
        .fromTo(".hero-speed-line", { scaleX: 0 }, { scaleX: 1, duration: 0.45, stagger: 0.08, transformOrigin: "left" }, "-=0.5");

      gsap.to(".hero-mobile-ping", {
        scale: 2.2,
        autoAlpha: 0,
        duration: 1.45,
        repeat: -1,
        repeatDelay: 0.8,
        ease: "power2.out",
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="accueil"
      data-nav-theme="light"
      className="relative px-4 pb-14 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="hero-copy max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/12 px-4 py-2 text-sm font-black text-ink">
            <MapPin size={16} />
            Livraison rapide à Lubumbashi
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.03] text-ink sm:text-5xl lg:text-6xl">
            Votre temps est précieux, nous le respectons.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-700 sm:text-lg">
            Livraison express, fiable et sécurisée pour particuliers, commerces, restaurants, pharmacies et entreprises à
            Lubumbashi.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#commande"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-gold hover:text-ink"
            >
              Trouver ma livraison
              <ArrowRight size={18} />
            </a>
            <a
              href="#packs"
              className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-4 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:border-gold hover:shadow-gold"
            >
              Voir nos packs
            </a>
          </div>

          <div className="hero-delivery-motion mt-8">
            <DeliveryMotion compact />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-ink/8 bg-white/80 p-3 shadow-sm sm:p-4">
                <strong className="hero-stat block text-xl font-black text-ink sm:text-2xl">{stat.value}</strong>
                <span className="mt-1 block text-xs font-semibold leading-5 text-neutral-600 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gold/18 blur-3xl" />
          <div className="hero-speed-line absolute -left-8 top-12 z-10 h-1 w-24 rounded-full bg-gold/70" />
          <div className="hero-speed-line absolute -left-5 top-20 z-10 h-1 w-16 rounded-full bg-white/70" />
          <div className="relative overflow-hidden rounded-2xl border border-white bg-ink shadow-soft">
            <Image
              src="/hero-delivery.png"
              alt="Livreur Mr. Delivery à moto"
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/92 p-3 shadow-soft backdrop-blur">
              <span className="hero-mobile-ping absolute left-6 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-gold/40" />
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-ink">Course confirmée</p>
                <p className="text-xs font-semibold text-neutral-600">Suivi, preuve et support WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
