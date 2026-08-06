"use client";

import { MessageCircle, PackageSearch, Send } from "lucide-react";
import { track } from "@vercel/analytics";
import { generateGeneralOrderMessage, generateWhatsAppLink } from "@/lib/whatsapp";

export function MobileActionBar() {
  return (
    <nav
      aria-label="Actions rapides"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-ink/10 bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl sm:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        <a
          href="#commande"
          onClick={() => track("mobile_action", { action: "order" })}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg bg-ink px-2 py-2 text-[0.68rem] font-black text-white"
        >
          <Send size={18} />
          Commander
        </a>
        <a
          href="#suivi"
          onClick={() => track("mobile_action", { action: "tracking" })}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-black text-ink"
        >
          <PackageSearch size={19} />
          Suivre
        </a>
        <a
          href={generateWhatsAppLink(generateGeneralOrderMessage())}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("mobile_action", { action: "whatsapp" })}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-black text-[#137c3d]"
        >
          <MessageCircle size={19} />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
