import type { Metadata } from "next";
import { EMAIL_ADDRESS, EMAIL_LINK } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Mr. Delivery",
  description: "Utilisation et protection des données clients par Mr. Delivery.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-12 text-ink sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-black text-gold">Retour au site</a>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-gold">Vos données</p>
        <h1 className="mt-3 text-4xl font-black">Politique de confidentialité</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">Dernière mise à jour: 6 août 2026.</p>

        <div className="mt-10 space-y-9 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="text-xl font-black text-ink">Données collectées</h2>
            <p className="mt-3">Lorsqu’une commande est réellement confirmée, Mr. Delivery peut enregistrer le nom, le numéro de téléphone, les lieux de ramassage et de livraison, le type de colis, les informations de paiement et l’historique des statuts.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-ink">Géolocalisation</h2>
            <p className="mt-3">La position GPS n’est utilisée qu’après votre autorisation. Elle sert à créer un lien Google Maps pour faciliter le ramassage ou la livraison. Le site ne réalise aucun suivi permanent de votre appareil.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-ink">Utilisation et partage</h2>
            <p className="mt-3">Les données servent à organiser la livraison, communiquer sur son statut, établir la facture et traiter une réclamation. Elles ne sont pas vendues. Elles peuvent être communiquées au personnel ou au livreur chargé de la course, uniquement dans la mesure nécessaire.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-ink">Conservation</h2>
            <p className="mt-3">Les données opérationnelles sont conservées au maximum 24 mois après la dernière activité de la commande, puis supprimées ou anonymisées, sauf obligation légale ou litige en cours.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-ink">Vos demandes</h2>
            <p className="mt-3">Vous pouvez demander l’accès, la correction ou la suppression de vos données en indiquant votre code de suivi à <a className="font-black text-gold" href={EMAIL_LINK}>{EMAIL_ADDRESS}</a>. Une vérification d’identité pourra être demandée afin de protéger la commande.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-ink">Services externes</h2>
            <p className="mt-3">Le service utilise notamment WhatsApp, Google Maps, Vercel et Neon. Leur utilisation peut être soumise à leurs propres politiques de confidentialité.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
