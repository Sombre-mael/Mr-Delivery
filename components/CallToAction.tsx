"use client";

import { ArrowRight, Check, Phone } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { trustArguments } from "@/lib/data";
import { DISPLAY_PHONE_NUMBER, PHONE_LINK } from "@/lib/whatsapp";

export function CallToAction() {
  return (
    <section data-nav-theme="light" className="bg-gold px-4 py-16 text-ink sm:px-6 lg:px-8">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Pret a envoyer votre colis ?</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-ink/76">
              Commandez en quelques secondes via WhatsApp. Un livreur Mr. Delivery s'occupe du reste.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#commande"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-white hover:text-ink"
              >
                Lancer l'assistant
                <ArrowRight size={18} />
              </a>
              <a
                href={PHONE_LINK}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/80 px-6 py-4 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
              >
                <Phone size={18} />
                {DISPLAY_PHONE_NUMBER}
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustArguments.map((argument) => (
              <div key={argument} className="flex items-center gap-2 rounded-lg bg-white/82 p-3 text-sm font-black shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
                  <Check size={16} />
                </span>
                {argument}
              </div>
            ))}
          </div>
        </div>
      </GsapReveal>
    </section>
  );
}
