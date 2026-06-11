"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type GsapRevealProps = {
  children: ReactNode;
  className?: string;
  selector?: string;
  opacity?: number;
  y?: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
};

export function GsapReveal({
  children,
  className,
  selector,
  opacity = 0,
  y = 28,
  delay = 0,
  stagger = 0.08,
  once = true,
}: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const select = gsap.utils.selector(scope);
      const targets = selector ? select(selector) : scope.current;

      if (!targets) {
        return;
      }

      if (reduceMotion) {
        gsap.set(targets, { clearProps: "all" });
        return;
      }

      const animation = gsap.fromTo(
        targets,
        {
          opacity,
          y,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.78,
          ease: "power3.out",
          delay,
          stagger: selector ? stagger : 0,
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 82%",
            once,
          },
        },
      );

      return () => {
        animation.kill();
        gsap.set(targets, { clearProps: "opacity,transform" });
      };
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
