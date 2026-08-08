import type { Metadata } from "next";
import Image from "next/image";
import { PackageSearch, QrCode } from "lucide-react";
import { PwaInstallGate } from "@/components/PwaInstallGate";
import { TrackingCodeForm } from "@/components/TrackingCodeForm";
import { GsapReveal } from "@/components/GsapReveal";

export const metadata: Metadata = {
  title: "Suivre mon colis | Mr. Delivery",
  description: "Consultez l'état de votre livraison Mr. Delivery avec votre code de suivi.",
};

type TrackPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "missing";
  const hasInvalidError = params?.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
      <PwaInstallGate />
      <GsapReveal className="w-full max-w-xl">
        <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft sm:p-8">
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

        <div className="mt-6">
          <TrackingCodeForm source="tracking_page" error={hasError ? "missing" : hasInvalidError ? "invalid" : undefined} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#fffdf7] p-4 text-sm leading-6 text-neutral-600">
          <QrCode className="mt-0.5 shrink-0 text-gold" size={20} />
          <p>Si vous avez une facture avec QR code, scannez-la simplement avec votre téléphone.</p>
        </div>

        <a href="/" className="mt-5 inline-flex text-sm font-black text-neutral-500 transition hover:text-gold">
          Retour au site principal
        </a>
        </section>
      </GsapReveal>
    </main>
  );
}
