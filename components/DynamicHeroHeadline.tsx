"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, prefersReducedMotion } from "@/lib/motion";

const heroMessages = [
  { lead: "Votre temps est précieux,", accent: "nous le respectons." },
  { lead: "Votre colis avance.", accent: "Votre journée continue." },
  { lead: "De votre porte à destination,", accent: "sans stress." },
  { lead: "À Lubumbashi, livrer devient", accent: "plus simple." },
] as const;

const MESSAGE_DURATION = 4600;

export function DynamicHeroHeadline() {
  const messageRef = useRef<HTMLSpanElement>(null);
  const exitTweenRef = useRef<gsap.core.Tween | null>(null);
  const firstRenderRef = useRef(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useGSAP(
    () => {
      if (!messageRef.current || firstRenderRef.current || prefersReducedMotion()) {
        firstRenderRef.current = false;
        return;
      }

      gsap.fromTo(
        messageRef.current,
        { autoAlpha: 0, y: 16, rotateX: -6, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: motion.duration.base,
          ease: motion.ease.enter,
          clearProps: "opacity,visibility,transform,filter",
        },
      );
    },
    { dependencies: [activeIndex] },
  );

  useEffect(() => {
    if (prefersReducedMotion() || isPaused) return;

    const timer = window.setTimeout(() => {
      if (!messageRef.current) return;

      exitTweenRef.current = gsap.to(messageRef.current, {
        autoAlpha: 0,
        y: -14,
        rotateX: 5,
        filter: "blur(5px)",
        duration: motion.duration.fast,
        ease: motion.ease.exit,
        onComplete: () => setActiveIndex((current) => (current + 1) % heroMessages.length),
      });
    }, MESSAGE_DURATION);

    return () => {
      window.clearTimeout(timer);
      exitTweenRef.current?.kill();
      exitTweenRef.current = null;
    };
  }, [activeIndex, isPaused]);

  function selectMessage(index: number) {
    if (index === activeIndex || !messageRef.current) return;

    if (prefersReducedMotion()) {
      setActiveIndex(index);
      return;
    }

    exitTweenRef.current?.kill();
    exitTweenRef.current = gsap.to(messageRef.current, {
      autoAlpha: 0,
      y: -10,
      duration: motion.duration.instant,
      ease: motion.ease.exit,
      onComplete: () => setActiveIndex(index),
    });
  }

  const activeMessage = heroMessages[activeIndex];

  return (
    <div
      className="mt-5 sm:mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <h1 className="min-h-[9rem] text-4xl font-black leading-[1.03] text-ink sm:min-h-[9.5rem] sm:text-5xl lg:min-h-[8rem] lg:text-6xl">
        <span ref={messageRef} className="block origin-center [perspective:700px]">
          <span className="block">{activeMessage.lead}</span>
          <span className="block text-[#946500]">{activeMessage.accent}</span>
        </span>
      </h1>

      <div className="mt-3 flex items-center gap-2" aria-label="Choisir le message principal">
        {heroMessages.map((message, index) => (
          <button
            key={`${message.lead}-${message.accent}`}
            type="button"
            onClick={() => selectMessage(index)}
            aria-label={`Message ${index + 1}`}
            aria-pressed={activeIndex === index}
            className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
              activeIndex === index ? "w-8 bg-gold" : "w-2 bg-ink/18 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
