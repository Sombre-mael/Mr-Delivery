import type { Metadata } from "next";
import Image from "next/image";
import { PackageSearch, QrCode } from "lucide-react";
import { trackOrderAction } from "@/app/track/actions";

export const metadata: Metadata = {
  title: "Suivre mon colis | Mr. Delivery",
  description: "Consultez l'etat de votre livraison Mr. Delivery avec votre code de suivi.",
};

type TrackPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "missing";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
      <section className="w-full max-w-xl rounded-2xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-mr-delivery.jpeg"
            alt="Logo Mr. Delivery"
            width={52}
            height={52}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Suivi colis</p>
            <h1 className="text-2xl font-black">Mr. Delivery</h1>
          </div>
        </div>

        <div className="mt-7 rounded-xl bg-ink p-5 text-white">
          <PackageSearch className="text-gold" size={30} />
          <h2 className="mt-4 text-2xl font-black">Entrez votre code de suivi</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Ce code se trouve dans le message WhatsApp ou sur le QR code de votre facture.
          </p>
        </div>

        <form action={trackOrderAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Code de suivi</span>
            <input
              name="trackingCode"
              placeholder="MRD-ABC123"
              className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-black uppercase outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
            />
          </label>

          {hasError ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Ajoutez votre code de suivi avant de continuer.
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-black text-ink shadow-gold transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
          >
            Suivre mon colis
          </button>
        </form>

        <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#fffdf7] p-4 text-sm leading-6 text-neutral-600">
          <QrCode className="mt-0.5 shrink-0 text-gold" size={20} />
          <p>Si vous avez une facture avec QR code, scannez-la simplement avec votre telephone.</p>
        </div>

        <a href="/" className="mt-5 inline-flex text-sm font-black text-neutral-500 transition hover:text-gold">
          Retour au site principal
        </a>
      </section>
    </main>
  );
}
