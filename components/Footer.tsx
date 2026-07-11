import Image from "next/image";
import { packs, services } from "@/lib/data";
import { DISPLAY_PHONE_NUMBER, EMAIL_ADDRESS, EMAIL_LINK, PHONE_LINK } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer id="contact" data-nav-theme="dark" className="bg-ink px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mr-delivery.jpeg"
              alt="Logo Mr. Delivery"
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <span className="text-lg font-black">Mr. Delivery</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
            Livraison rapide, fiable et sécurisée pour particuliers, commerces, restaurants, pharmacies et entreprises.
          </p>
          <p className="mt-4 text-sm font-black text-gold">Votre temps est précieux, nous le respectons.</p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/68">
            {services.slice(0, 5).map((service) => (
              <li key={service.title}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gold">Packs</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/68">
            {packs.map((pack) => (
              <li key={pack.name}>{pack.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gold">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/68">
            <li>Lubumbashi, RDC</li>
            <li>
              <a href={PHONE_LINK} className="transition hover:text-gold">
                Appel normal : {DISPLAY_PHONE_NUMBER}
              </a>
            </li>
            <li>
              <a href={EMAIL_LINK} className="transition hover:text-gold">
                Email : {EMAIL_ADDRESS}
              </a>
            </li>
            <li>WhatsApp Business : {DISPLAY_PHONE_NUMBER}</li>
            <li>Disponible 7j/7 dès 7h00</li>
            <li>
              <a href="/operator" className="font-black text-gold transition hover:text-white">
                Espace équipe
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs font-semibold text-white/45">
        &copy; {new Date().getFullYear()} Mr. Delivery. Tous droits réservés.
      </div>
    </footer>
  );
}
