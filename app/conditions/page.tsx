import type { Metadata } from "next";
import { DISPLAY_PHONE_NUMBER, EMAIL_ADDRESS, EMAIL_LINK, PHONE_LINK } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Conditions de service | Mr. Delivery",
  description: "Règles de réservation, paiement et livraison Mr. Delivery.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-12 text-ink sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-black text-gold">Retour au site</a>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-gold">Cadre du service</p>
        <h1 className="mt-3 text-4xl font-black">Conditions de service</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">Dernière mise à jour: 6 août 2026.</p>

        <div className="mt-10 space-y-9 text-sm leading-7 text-neutral-700">
          <section><h2 className="text-xl font-black text-ink">Réservation et paiement</h2><p className="mt-3">Les tarifs affichés sont indicatifs. Le prix final, le délai et la disponibilité sont confirmés sur WhatsApp. Le paiement est effectué avant la réservation et la prise en charge du colis. Une demande envoyée depuis le site ne devient une commande qu’après confirmation par l’équipe.</p></section>
          <section><h2 className="text-xl font-black text-ink">Informations du client</h2><p className="mt-3">Le client doit fournir des coordonnées, adresses et informations de colis exactes. Un retard ou un coût supplémentaire provoqué par une information incorrecte peut faire l’objet d’une nouvelle confirmation tarifaire.</p></section>
          <section><h2 className="text-xl font-black text-ink">Objets interdits</h2><p className="mt-3">Sont refusés les produits illégaux, armes, substances dangereuses non déclarées, espèces non autorisées, marchandises volées et tout colis dont le transport met en danger le livreur ou le public. Mr. Delivery peut demander à vérifier la nature du colis.</p></section>
          <section><h2 className="text-xl font-black text-ink">Annulation et remboursement</h2><p className="mt-3">Toute annulation doit être signalée immédiatement. Le remboursement dépend du stade de la course et des frais déjà engagés. Les conditions applicables sont confirmées par WhatsApp avant le départ du livreur.</p></section>
          <section><h2 className="text-xl font-black text-ink">Livraison et responsabilité</h2><p className="mt-3">Le destinataire doit être joignable et disponible. Les délais peuvent évoluer selon la circulation, la météo, les contrôles ou un cas de force majeure. Toute anomalie doit être signalée rapidement avec le code de suivi et, si possible, des photos.</p></section>
          <section><h2 className="text-xl font-black text-ink">Contact et réclamation</h2><p className="mt-3">Contactez Mr. Delivery au <a className="font-black text-gold" href={PHONE_LINK}>{DISPLAY_PHONE_NUMBER}</a> ou par email à <a className="font-black text-gold" href={EMAIL_LINK}>{EMAIL_ADDRESS}</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
