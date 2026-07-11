import { PackageSearch, QrCode } from "lucide-react";
import { trackOrderAction } from "@/app/track/actions";
import { GsapReveal } from "@/components/GsapReveal";

export function TrackingSection() {
  return (
    <section id="suivi" data-nav-theme="dark" className="bg-ink px-4 py-16 text-white sm:px-6 lg:px-8">
      <GsapReveal className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Suivi colis</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Voyez où en est votre livraison</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
            Entrez le code reçu par Mr. Delivery ou scannez le QR code de votre facture pour consulter l'état du colis.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-4 text-ink shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
              <PackageSearch size={22} />
            </span>
            <div>
              <h3 className="text-xl font-black">Suivre une commande</h3>
              <p className="text-sm text-neutral-600">Exemple: MRD-ABC123</p>
            </div>
          </div>

          <form action={trackOrderAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              name="trackingCode"
              placeholder="Code de suivi"
              className="min-h-12 flex-1 rounded-lg border border-ink/10 bg-[#fffdf7] px-4 text-sm font-black uppercase outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-black text-white transition hover:bg-gold hover:text-ink"
            >
              Suivre
            </button>
          </form>

          <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#fffdf7] p-4 text-sm leading-6 text-neutral-600">
            <QrCode className="mt-0.5 shrink-0 text-gold" size={20} />
            <p>Le QR code de la facture ouvre directement la page de suivi du colis.</p>
          </div>
        </div>
      </GsapReveal>
    </section>
  );
}
