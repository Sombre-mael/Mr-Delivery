"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GsapReveal } from "@/components/GsapReveal";
import { packs } from "@/lib/data";
import { generatePackMessage, generateWhatsAppLink } from "@/lib/whatsapp";

gsap.registerPlugin(useGSAP);

export function Packs() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>(".pack-card");
      const cleanups = cards.map((card) => {
        const enter = () => gsap.to(card, { y: -10, scale: 1.015, duration: 0.25, ease: "power2.out" });
        const leave = () => gsap.to(card, { y: 0, scale: 1, duration: 0.25, ease: "power2.out" });

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);

        return () => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope },
  );

  return (
    <section ref={scope} id="packs" data-nav-theme="light" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Nos Packs</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
              Choisissez le pack qui vous convient
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-neutral-600">
            Des offres claires pour les courses rapides, les commerces, la sante et les colis plus lourds.
          </p>
        </div>

        <GsapReveal selector=".pack-card" className="mt-9 grid gap-5 lg:grid-cols-5">
          {packs.map((pack) => {
            const link = generateWhatsAppLink(generatePackMessage(pack.name));

            return (
              <article
                key={pack.name}
                className={`pack-card relative flex min-h-[28rem] flex-col rounded-lg border p-5 shadow-sm transition hover:-translate-y-1 ${
                  pack.popular
                    ? "border-gold bg-ink text-white shadow-gold"
                    : "border-ink/8 bg-[#fffdf7] text-ink hover:border-gold/70"
                }`}
              >
                {pack.popular ? (
                  <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">
                    Populaire
                  </span>
                ) : null}

                <h3 className="pr-20 text-xl font-black">{pack.name}</h3>
                <p className={`mt-2 text-sm font-semibold ${pack.popular ? "text-white/70" : "text-neutral-600"}`}>
                  Ideal pour : {pack.idealFor}
                </p>

                <div className="mt-5">
                  <p className="text-2xl font-black">{pack.price}</p>
                  <p className={`mt-1 text-sm font-semibold ${pack.popular ? "text-gold" : "text-neutral-600"}`}>
                    Delai : {pack.delay}
                  </p>
                </div>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {pack.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm leading-6">
                      <CheckCircle2 className={pack.popular ? "text-gold" : "text-gold"} size={18} />
                      <span className={pack.popular ? "text-white/82" : "text-neutral-700"}>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
                    pack.popular ? "bg-gold text-ink hover:bg-white" : "bg-ink text-white hover:bg-gold hover:text-ink"
                  }`}
                >
                  <MessageCircle size={18} />
                  {pack.quote ? "Demander un devis" : "Commander via WhatsApp"}
                </a>
              </article>
            );
          })}
        </GsapReveal>
      </div>
    </section>
  );
}
