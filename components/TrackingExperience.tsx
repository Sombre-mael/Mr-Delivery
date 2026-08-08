"use client";

import { useRef } from "react";
import { track } from "@vercel/analytics";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, prefersReducedMotion } from "@/lib/motion";
import type { DeliveryStatus } from "@/lib/whatsapp";

type TrackingExperienceProps = {
  status: DeliveryStatus;
  children: React.ReactNode;
};

export function TrackingExperience({ status, children }: TrackingExperienceProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      track("tracking_viewed", { status });

      if (prefersReducedMotion()) return;

      const timeline = gsap.timeline({ defaults: { ease: motion.ease.enter } });
      timeline
        .fromTo(".tracking-enter", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: motion.duration.base, stagger: 0.07 })
        .fromTo(
          ".tracking-progress-line",
          { scaleY: 0 },
          { scaleY: 1, duration: motion.duration.slow, ease: motion.ease.soft },
          "-=0.2",
        )
        .fromTo(
          ".tracking-step",
          { autoAlpha: 0, x: -10 },
          { autoAlpha: 1, x: 0, duration: motion.duration.fast, stagger: 0.055 },
          "-=0.55",
        );

      const statusIcon = scope.current?.querySelector(".current-status-icon");
      if (!statusIcon) return;

      if (status === "in_delivery") {
        gsap.fromTo(statusIcon, { x: -5 }, { x: 6, duration: 0.65, ease: "sine.inOut", yoyo: true, repeat: 2 });
      } else if (status === "delivered") {
        gsap.fromTo(statusIcon, { scale: 0.75, rotate: -8 }, { scale: 1, rotate: 0, duration: 0.55, ease: motion.ease.spring });
        gsap.fromTo(".delivery-celebration", { scale: 0.65, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: motion.ease.spring });
      } else if (status === "picked_up" || status === "payment_confirmed") {
        gsap.fromTo(statusIcon, { scale: 0.78 }, { scale: 1, duration: 0.5, ease: motion.ease.spring });
      } else if (status === "issue") {
        gsap.fromTo(statusIcon, { rotate: -4 }, { rotate: 4, duration: 0.12, repeat: 3, yoyo: true, clearProps: "transform" });
      }
    },
    { scope, dependencies: [status] },
  );

  return <div ref={scope}>{children}</div>;
}
