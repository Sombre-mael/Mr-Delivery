"use client";

import Image from "next/image";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/data";
import { generateGeneralOrderMessage, generateWhatsAppLink, PHONE_LINK } from "@/lib/whatsapp";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [navTheme, setNavTheme] = useState<"light" | "dark">("light");
  const orderLink = generateWhatsAppLink(generateGeneralOrderMessage());

  useEffect(() => {
    const getThemeFromPoint = () => {
      const headerProbeY = 82;
      const probeX = window.innerWidth / 2;
      const elements = document.elementsFromPoint(probeX, headerProbeY);
      const themedElement = elements.find((element) => element instanceof HTMLElement && element.dataset.navTheme);

      if (themedElement instanceof HTMLElement && themedElement.dataset.navTheme === "dark") {
        setNavTheme("dark");
        return;
      }

      setNavTheme("light");
    };

    getThemeFromPoint();
    window.addEventListener("scroll", getThemeFromPoint, { passive: true });
    window.addEventListener("resize", getThemeFromPoint);

    return () => {
      window.removeEventListener("scroll", getThemeFromPoint);
      window.removeEventListener("resize", getThemeFromPoint);
    };
  }, []);

  const isDarkTheme = navTheme === "dark";
  const headerClass = isDarkTheme
    ? "border-white/10 bg-ink/88 text-white shadow-soft"
    : "border-ink/8 bg-white/94 text-ink shadow-soft";
  const linkClass = isDarkTheme ? "text-white/78 hover:text-gold" : "text-ink/72 hover:text-ink";
  const menuButtonClass = isDarkTheme
    ? "border-white/15 bg-white/10 text-white"
    : "border-ink/10 bg-ink/5 text-ink";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${headerClass}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#accueil" className="flex items-center gap-3" aria-label="Mr. Delivery accueil">
          <Image
            src="/logo-mr-delivery.jpeg"
            alt="Logo Mr. Delivery"
            width={44}
            height={44}
            className="h-11 w-11 rounded-lg object-cover"
          />
          <span className="text-base font-black tracking-wide sm:text-lg">Mr. Delivery</span>
        </a>

        <div className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`text-xs font-bold transition xl:text-sm ${linkClass}`}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={PHONE_LINK}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isDarkTheme ? "border-white/15 text-white hover:border-gold hover:text-gold" : "border-ink/10 text-ink hover:border-gold"
            }`}
            aria-label="Appeler Mr. Delivery"
          >
            <Phone size={18} />
          </a>
          <a
            href={orderLink}
            target="_blank"
            rel="noreferrer"
            className={`rounded-full bg-gold px-5 py-2.5 text-sm font-black text-ink shadow-gold transition hover:-translate-y-0.5 ${
              isDarkTheme ? "hover:bg-white" : "hover:bg-ink hover:text-white"
            }`}
          >
            Commander sur WhatsApp
          </a>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition lg:hidden ${menuButtonClass}`}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-ink/8 bg-white px-4 py-4 text-ink shadow-soft lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-black text-ink/78 transition hover:bg-amberSoft hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href={orderLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-black text-ink"
            >
              Commander sur WhatsApp
            </a>
            <a
              href={PHONE_LINK}
              className="rounded-full border border-ink/10 px-5 py-3 text-center text-sm font-black text-ink"
            >
              Appeler maintenant
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
