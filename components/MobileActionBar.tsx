"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, PackageSearch, Send } from "lucide-react";
import { track } from "@vercel/analytics";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { triggerHaptic } from "@/lib/haptics";
import { generateGeneralOrderMessage, generateWhatsAppLink } from "@/lib/whatsapp";

gsap.registerPlugin(useGSAP);

type ActiveAction = "order" | "tracking";

export function MobileActionBar() {
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [activeAction, setActiveAction] = useState<ActiveAction>("order");
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const sections = [
      { id: "commande", action: "order" as const },
      { id: "suivi", action: "tracking" as const },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        const section = sections.find((item) => item.id === visible.target.id);
        if (section) setActiveAction(section.action);
      },
      { rootMargin: "-32% 0px -56% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const handleFocus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        setKeyboardOpen(true);
      }
    };
    const handleBlur = () => window.setTimeout(() => setKeyboardOpen(false), 120);

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  useGSAP(() => {
    if (!indicatorRef.current) return;
    gsap.to(indicatorRef.current, {
      xPercent: activeAction === "tracking" ? 100 : 0,
      duration: 0.38,
      ease: "power3.out",
    });
  }, [activeAction]);

  function navigateTo(event: React.MouseEvent<HTMLAnchorElement>, id: string, action: ActiveAction) {
    event.preventDefault();
    setActiveAction(action);
    triggerHaptic("select");
    track("mobile_action", { action });
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Actions rapides"
      className={`fixed inset-x-0 bottom-0 z-[55] border-t border-ink/10 bg-white/96 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl transition-transform duration-300 sm:hidden ${
        keyboardOpen ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative mx-auto grid max-w-md grid-cols-3 gap-2">
        <span ref={indicatorRef} className="pointer-events-none absolute inset-y-0 left-0 w-1/3 rounded-lg bg-ink shadow-soft" />
        <a
          href="#commande"
          onClick={(event) => navigateTo(event, "commande", "order")}
          className={`relative z-10 flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-black transition-colors ${
            activeAction === "order" ? "text-white" : "text-ink"
          }`}
        >
          <Send size={18} /> Commander
        </a>
        <a
          href="#suivi"
          onClick={(event) => navigateTo(event, "suivi", "tracking")}
          className={`relative z-10 flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-black transition-colors ${
            activeAction === "tracking" ? "text-white" : "text-ink"
          }`}
        >
          <PackageSearch size={19} /> Suivre
        </a>
        <a
          href={generateWhatsAppLink(generateGeneralOrderMessage())}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            triggerHaptic("select");
            track("mobile_action", { action: "whatsapp" });
          }}
          className="relative z-10 flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-black text-[#137c3d]"
        >
          <MessageCircle size={19} /> WhatsApp
        </a>
      </div>
    </nav>
  );
}
