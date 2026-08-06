"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Mr. Delivery page error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
      <section className="w-full max-w-lg rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase text-gold">Service momentanément indisponible</p>
        <h1 className="mt-3 text-3xl font-black">Nous n’avons pas pu charger cette page.</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">
          Votre demande n’a pas été perdue. Réessayez ou contactez directement Mr. Delivery sur WhatsApp.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={reset} className="rounded-full bg-ink px-6 py-3 text-sm font-black text-white">
            Réessayer
          </button>
          <a href="https://wa.me/243819428849" className="rounded-full bg-gold px-6 py-3 text-sm font-black text-ink">
            Ouvrir WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
