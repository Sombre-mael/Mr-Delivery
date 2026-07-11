import { CreditCard, FileCheck2, ShieldCheck, WalletCards } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { paymentRules } from "@/lib/data";

const icons = [WalletCards, CreditCard, ShieldCheck, FileCheck2];

export function Regulations() {
  return (
    <section id="reglement" data-nav-theme="light" className="bg-white px-4 py-16 text-ink sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Règlement</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Des conditions claires avant chaque course
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Le paiement est effectué avant la réservation. Mr. Delivery confirme ensuite la disponibilité, le tarif et
            l'organisation de la livraison.
          </p>
        </div>

        <GsapReveal selector=".rule-card" className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paymentRules.map((rule, index) => {
            const Icon = icons[index] ?? ShieldCheck;

            return (
              <article key={rule.title} className="rule-card rounded-lg border border-ink/8 bg-[#fffdf7] p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amberSoft text-ink">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-lg font-black text-ink">{rule.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{rule.description}</p>
              </article>
            );
          })}
        </GsapReveal>
      </div>
    </section>
  );
}
