"use client";

import { MessageCircle } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { generateGeneralOrderMessage, generateWhatsAppLink } from "@/lib/whatsapp";

gsap.registerPlugin(useGSAP);

export function WhatsAppButton() {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !buttonRef.current) {
      return;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.55 });
    timeline
      .to(buttonRef.current, { scale: 1.045, boxShadow: "0 0 0 14px rgba(37, 211, 102, 0.12)", duration: 0.72, ease: "sine.inOut" })
      .to(buttonRef.current, { scale: 1, boxShadow: "0 0 0 8px rgba(37, 211, 102, 0.08)", duration: 0.72, ease: "sine.inOut" });
  });

  return (
    <a
      ref={buttonRef}
      href={generateWhatsAppLink(generateGeneralOrderMessage())}
      target="_blank"
      rel="noreferrer"
      aria-label="Commander sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-soft ring-8 ring-[#25d366]/15 transition hover:-translate-y-1 hover:scale-105 sm:h-16 sm:w-16"
    >
      <MessageCircle size={28} />
    </a>
  );
}
